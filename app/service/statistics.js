const es = require('elasticsearch')
const throttle = require("lodash/throttle")

module.exports = app => {
  const ES_SERVER = app.config.es.host
  const ES_INDEX = app.config.es.index
  const ES_TYPE = app.config.es.type

  const esClient = new es.Client({
    host: ES_SERVER,
    apiVersion: '5.6',
    log: process.env.NODE_ENV === 'production' ? 'error' : 'trace'
  })

  var notify = throttle((err) => {
    app.DDNotify(`${err.name} \n\n ${err.message} \n\n ${err.stack}`, 'ES请求异常')
  }, 30000)

  let reportsQueue = []
  class Statistics extends app.Service {

    report (doc) {
      if (doc instanceof Array) {
        reportsQueue = reportsQueue.concat(doc)
      } else {
        reportsQueue.push(doc)
      }
    }

    async addDoc (doc) {
      let {ctx} = this
      let res = {created: false}
      let nowTime = new Date()
      let indices = ES_INDEX + ctx.helper.tools.timeFormat(nowTime, '_yyyy_MM')
      try {
        await this.createIndex(indices)
        res = await esClient.index({
          index: indices,
          type: ES_TYPE,
          body: doc
        })
      } catch (e) {
        console.error(e)
        notify(e)
      }
      return res.created
    }

    async addDocs (docs) {
      let fromQuene = false
      if (!docs || !docs.length) {
        fromQuene = true
        docs = reportsQueue.slice(0)
      }
      let {ctx} = this
      if (toString.call(docs) !== toString.call(docs)) {
        console.warn('addDocs: docs is not a Array, canceled')
        return true
      }
      let res = {errors: true}
      let nowTime = new Date()
      let indices = ES_INDEX + ctx.helper.tools.timeFormat(nowTime, '_yyyy_MM')
      let orderedDocs = docs.filter(d => d && d.create_time > 0).map(d => [
        { index:  { _index: indices, _type: ES_TYPE } },
        d // the document to index
      ])
      if (!orderedDocs.length) {
        console.warn('addDocs: no valid docs be added')
        return true
      }
      let orders = orderedDocs.reduce((o, d) => o.concat(d), [])
      try {
        await this.createIndex(indices)
        res = await esClient.bulk({
          body: orders
        })
        if (fromQuene) reportsQueue = []
      } catch (e) {
        console.error(e)
        notify(e)
      }
      return !res.errors
    }

    async search ({filter, timePeriod = [], size = 10, aggs, mustNot} = {}) {
      let {ctx} = this
      let res = {}
      let timeRange
      let patterns = filter
      if (timePeriod.length > 0) {
        timeRange = ['gte', 'lte']
          .map((t, i) => [t, timePeriod[i]])
          .reduce((o, t) => {
            if (t[1] > 0) o[t[0]] = t[1]
            return o
          }, {})
        patterns.push({range: { create_time: timeRange }})
      }
    
      let body = {
        query: {
          bool: {
            filter: patterns
          }
        },
        aggs,
        size
      }

      if (mustNot) body.query.bool.must_not = mustNot
      
      try {
        res = await esClient.search({
          index: ES_INDEX + '*',
          body,
        })
      } catch (e) {
        console.error(e)
        notify(e)
      }
      return res
    }

    async getPUV ({pageId, pageIds, timePeriod, utm, interval = 'day', appId = 'tview'}) {
      if (['day', 'hour', 'week'].indexOf(interval) < 0) interval = 'day'
      let {hits, aggregations} = await this.search(
        {
          filter: (() => {
            var li = [
              {term: { 'action.keyword': 'pageview' }},
              {term: { 'app_id.keyword': appId }},
            ]
            if (pageIds && pageIds.length) li.push({terms: { 'page_id.keyword': pageIds }})
            else if (pageId) li.push({term: { 'page_id.keyword': pageId }})
            if (utm && utm.length >= 1 && utm !== 'N/A') li.push({term: { 'utm_campaign.keyword': utm }})
            return li
          })(),
          timePeriod,
          mustNot: utm === 'N/A' ? { exists: { field: 'utm_campaign' } } : null,
          size: 0,
          aggs: {
            histogram: {
              date_histogram: {
                field: 'create_time',
                time_zone: "+08:00",
                interval: interval,
              },
              aggs: {
                distinct_user: {
                  cardinality: {
                    script: {
                      lang: 'painless',
                      inline: 'doc["page_id.keyword"].value + "_" + doc["finger_print.keyword"].value'
                    }
                  }
                }
              }
            },
            distinct_user: {
              sum_bucket: {
                buckets_path: 'histogram>distinct_user'
              }
            },
            all_user: {
              cardinality: {
                script: {
                  lang: 'painless',
                  inline: 'doc["page_id.keyword"].value + "_" + doc["finger_print.keyword"].value'
                }
              }
            },
          }
        }
      )
      return {
        sum: {
          pv: hits && hits.total || 0,
          uv: aggregations && aggregations['distinct_user'].value,
          user: aggregations && aggregations['all_user'].value,
        },
        histogram: (aggregations && aggregations.histogram.buckets || []).map(h => {
          return {
            dateStr: h.key_as_string,
            date: h.key,
            pv: h.doc_count,
            uv: h.distinct_user && h.distinct_user.value
          }
        })
      }
    }

    async getPages ({appId, timePeriod, size = 20}) {
      let {aggregations} = await this.search(
        {
          filter: [
            {term: { 'action.keyword': 'pageview' }},
            {term: { 'app_id.keyword': appId }},
          ],
          timePeriod,
          size: 0,
          aggs: {
            page_count: {
              cardinality: {
                field : "page_id.keyword"
              }
            },
            page_list: {
              terms: {
                field: 'page_id.keyword',
                size: size
              },
              aggs: {
                distinct_user: {
                  cardinality: {
                    field: "finger_print.keyword"
                  }
                }
              }
            }
          }
        }
      )
    
      return {
        count: aggregations && aggregations.page_count.value || 0,
        list: aggregations && aggregations.page_list.buckets.map(p => {
          return {
            key: p.key,
            pv: p.doc_count,
            uv: p.distinct_user.value || 0
          }
        })
      }
    }
    
    async getActions ({appId, pageId, utm, timePeriod, size = 20}) {
      let {aggregations} = await this.search(
        {
          filter: (() => {
            var li = [
              {term: { 'app_id.keyword': appId }},
              {term: { 'page_id.keyword': pageId }},
            ]
            if (utm && utm.length >= 1 && utm !== 'N/A') li.push({term: { 'utm_campaign.keyword': utm }})
            return li
          })(),
          timePeriod,
          mustNot: utm === 'N/A' ? { exists: { field: 'utm_campaign' } } : null,
          size: 0,
          aggs: {
            action_count: {
              cardinality: {
                field : "action.keyword"
              }
            },
            action_list: {
              terms: {
                field: 'action.keyword',
                size: size
              }
            }
          }
        }
      )
    
      return {
        count: aggregations && aggregations.action_count.value || 0,
        list: aggregations && aggregations.action_list.buckets.map(p => {
          return {
            action: p.key,
            count: p.doc_count
          }
        })
      }
    }

    async getViewTime ({appId, pageId, utm, timePeriod, interval, avgonly}) {
      if (['day', 'hour', 'week'].indexOf(interval) < 0) interval = 'day'
      let {aggregations} = await this.search(
        {
          filter: (() => {
            var li = [
              {term: { 'app_id.keyword': appId }},
              {term: { 'action.keyword': 'PV_TIME' }},
              {range: { durations: { lte: 3600, gte: -0.1 } }} // 防止越界 half_float 65504
            ]
            if (pageId && pageId.length >= 1) li.push({term: { 'page_id.keyword': pageId }})
            if (utm && utm.length >= 1 && utm !== 'N/A') li.push({term: { 'utm_campaign.keyword': utm }})
            return li
          })(),
          timePeriod,
          mustNot: utm === 'N/A' ? { exists: { field: 'utm_campaign' } } : null,
          size: 0,
          aggs: (() => {
            var option = {
              avarage: {
                avg : {
                  field: 'durations',
                  missing: 0
                }
              },
            }
            if (!avgonly) {
              option.histogram = {
                date_histogram: {
                  field: 'create_time',
                  time_zone: '+08:00',
                  interval: interval,
                },
                aggs: {
                  avarage: {
                    avg : {
                      field: 'durations',
                      missing: 0
                    }
                  },
                }
              }
            }
            return option
          })() 
          
        }
      )
    
      return {
        avarage: aggregations && (+aggregations.avarage.value | 0) || 0,
        list: aggregations && aggregations.histogram && aggregations.histogram.buckets.map(p => {
          return {
            dateStr: p.key_as_string,
            date: p.key,
            avarage: +p.avarage.value | 0
          }
        })
      }
    }

    async getUtms ({appId, pageId, timePeriod, size = 20}) {
      let {aggregations} = await this.search(
        {
          filter: [
            {term: { 'app_id.keyword': appId }},
            {term: { 'page_id.keyword': pageId }},
          ],
          timePeriod,
          size: 0,
          aggs: {
            utm_count: {
              cardinality: {
                field : "utm_campaign.keyword"
              }
            },
            utm_list: {
              terms: {
                field: 'utm_campaign.keyword',
                size,
                missing: 'N/A'
              }
            }
          }
        }
      )
    
      return {
        count: aggregations && aggregations.utm_count.value || 0,
        list: aggregations && aggregations.utm_list.buckets.map(p => {
          return {
            utm: p.key,
            count: p.doc_count
          }
        })
      }
    }

    async getTodayOutline ({appId = 'tview'}) {
      let now = Date.now()
      let todayStart = now - (now + 8 * 3600000) % 86400000
      let yesterdayNow = now - 86400000
      let yesterdayStart = todayStart - 86400000
      
      let todaySearch = this.search(
        {
          filter: [
            {term: { 'action.keyword': 'pageview' }},
            {term: { 'app_id.keyword': appId }},
          ],
          timePeriod: [yesterdayStart, now],
          size: 0,
          aggs: [['yesterday', yesterdayStart, todayStart], ['today', todayStart, now], ['yesterdayNow', yesterdayStart, yesterdayNow]]
            .reduce((o, i) => {
              var [key, start, end] = i
              o[key] = {
                filter: {
                  range: {
                    create_time: {gte: start, lte: end}
                  }
                },
                aggs: {
                  distinct_user: {
                    cardinality: {
                      script: {
                        lang: 'painless',
                        inline: 'doc["page_id.keyword"].value + "_" + doc["finger_print.keyword"].value'
                      }
                    }
                  }
                }
              }
              return o
            },{})
        }
      )
      let historySearch = this.search(
        {
          filter: [
            {term: { 'action.keyword': 'pageview' }},
            {term: { 'app_id.keyword': appId }},
          ],
          timePeriod: [0, now],
          size: 0,
          aggs: {
            histogram: {
              date_histogram: {
                field: 'create_time',
                time_zone: '+08:00',
                interval: 'day',
              },
              aggs: {
                distinct_user: {
                  cardinality: {
                    script: {
                      lang: 'painless',
                      inline: 'doc["page_id.keyword"].value + "_" + doc["finger_print.keyword"].value'
                    }
                  }
                }
              }
            },
            maxuv: {
              max_bucket: {
                buckets_path: 'histogram>distinct_user'
              }
            },
            avguv: {
              avg_bucket: {
                gap_policy: 'skip',
                buckets_path: 'histogram>distinct_user'
              }
            },
            maxpv: {
              max_bucket: {
                buckets_path: 'histogram._count'
              }
            },
            avgpv: {
              avg_bucket: {
                gap_policy: 'skip',
                buckets_path: 'histogram._count'
              }
            }
          }
        }
      )
      let [{aggregations: todayData} = {}, {aggregations: historyData} = {}] = await Promise.all([todaySearch, historySearch])
      var table = 
      [
        ...[['today', '今日'], ['yesterday', '昨日'], ['yesterdayNow', '昨日此时']].map(i => {
          var [key, name] = i
          if (!todayData[key]) return {}
          return {key, name, pv: todayData[key].doc_count, uv: todayData[key].distinct_user.value}
        }),
        ...[['avg', '每日平均'], ['max', '历史峰值']].map(i => {
          var [key, name] = i
          var o = {key, name, pv: historyData[`${key}pv`].value, uv: historyData[`${key}uv`].value}
          if (key === 'max') {
            ;['maxpv', 'maxuv'].reduce((o, i) => {
              var dates = historyData[i].keys
              o[`${i}Date`] = dates && dates[dates.length - 1] || ''
              return o
            }, o)
          }
          return o
        })
      ]
      return table
    }
    
    async actionTrack ({pageId, action, utm, timePeriod, size = 0, interval = 'day', appId = 'tview'}) {
      if (['day', 'hour', 'week'].indexOf(interval) < 0) interval = 'day'
      let {hits, aggregations} = await this.search(
        {
          filter: (() => {
            var li = [
              {term: { 'action.keyword': action }},
              {term: { 'app_id.keyword': appId }},
              {term: { 'page_id.keyword': pageId }},
            ]
            if (utm && utm.length >= 1 && utm !== 'N/A') li.push({term: { 'utm_campaign.keyword': utm }})
            return li
          })(),
          timePeriod,
          mustNot: utm === 'N/A' ? { exists: { field: 'utm_campaign' } } : null,
          size,
          aggs: {
            distinct_user: {
              sum_bucket: {
                buckets_path: 'histogram>distinct_user'
              }
            },
            histogram: {
              date_histogram: {
                field: 'create_time',
                time_zone: "+08:00",
                interval: interval,
              },
              aggs: {
                distinct_user: {
                  cardinality: {
                    field: "finger_print.keyword"
                  }
                }
              }
            },
            labels: {
              terms: {
                field: 'label.keyword'
              }
            }
          }
        }
      )
    
      return {
        sum: {
          count: hits && hits.total || 0,
          distinct_user: aggregations && aggregations['distinct_user'].value
        },
        list: hits && hits.hits.map(h => h._source),
        histogram: (aggregations && aggregations.histogram.buckets || []).map(h => {
          return {
            dateStr: h.key_as_string,
            date: h.key,
            count: h.doc_count,
            distinct_user: h.distinct_user.value
          }
        }),
        labels: (aggregations && aggregations.labels.buckets || []).map(h => {
          return {
            label: h.key,
            count: h.doc_count
          }
        })
      }
    }

    async createIndex (indices) {
      if (!this.createIndex.created) this.createIndex.created = {}
      if (this.createIndex.created[indices]) return true

      let exists = await esClient.indices.exists({index: indices})
      if (!exists) {
        let result
        result = await esClient.indices.create({index: indices})
        result = await esClient.indices.putMapping({
          index: indices,
          type: ES_TYPE,
          body: {
            properties: {
              create_time: {
                type: 'date',
                format: 'yyy/MM/dd HH:mm:ss||yyyy/MM/dd||epoch_millis'
              },
              ip: {
                type: 'ip'
              },
              durations: {
                type: 'half_float'
              }
            }
          }
        })
        console.info('create indices', result)
      }
      this.createIndex.created[indices] = 1
    }

    async deleteIndices ({monthBefore = 6} = {}) {
      let ctx = this.ctx
      if (monthBefore <= 0) {
        console.warn('monthBefore less than 1, cannot do that')
        return -1
      }
      if (monthBefore > 11) {
        console.warn('monthBefore greater than 12, cannot do that')
        return -2
      }
      let date = new Date()
      let endYear = date.getFullYear()
      let endMonth = date.getMonth() + 1
      let indices = Array.apply(null, {length: 12}).map((_, i) => {
        let m = i - 12 + Number(endMonth)
        let y = (m < 0 ? -1 : 0) + Number(endYear)
        return `${ES_INDEX}_${y}_${`0${(m + 12) % 12 + 1}`.slice(-2)}`
      })
      let result
      result = await Promise.all(indices.slice(0, 12 - monthBefore).map(async (i) => {
        let exists = await esClient.indices.exists({index: i})
        let result = ''
        if (exists) result = await esClient.indices.delete({index: i})
        return {
          index: i,
          exists,
          result
        }
      }))
      console.info('delete indices', result)
      return result
    }
  }

  return Statistics
}