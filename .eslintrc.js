module.exports = {
  root: true,
  parserOptions: {
    sourceType: 'module'
  },
  // https://github.com/feross/standard/blob/master/RULES.md#javascript-standard-style
  extends: 'standard',
  // required to lint *.vue files
  plugins: [
    'html'
  ],
  // add your custom rules here
  'rules': {
    "no-multi-spaces": 0,
    "no-eval": 0,
    "no-new": 0,
    // allow paren-less arrow functions
    'arrow-parens': 0,
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0,
    "eqeqeq": 0, // 必须使用全等
    "comma-dangle": [ 2, "never" ]            //定义数组或对象最后多余的逗号
  }
}
