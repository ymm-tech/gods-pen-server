# 路径配置
admin = sub/gods-pen-admin
editor = sub/gods-pen

# 安装依赖
install-lib: install-server install-admin install-editor
	@yarn cache clean && echo '所有依赖安装完成'

install-server:
	@yarn --pure-lockfile --production && echo 'server依赖安装完成'

install-admin:
	@cd $(admin) && yarn --pure-lockfile && echo 'admin依赖安装完成'

install-editor:
	@cd $(editor) && yarn --pure-lockfile && echo 'editor依赖安装完成'

# 构建后台
build-admin:
	cd $(admin) && npm run build-docker && cp -rf ./dist/. ../../sub-build/

# 构建编辑器（含终端页面）
build-editor:
	cd $(editor) && npm run editor:build-docker && npm run client:build-docker && cp -rf ./dist/. ../../sub-build/

# 清理文件
clear-sub:
	-rm -rf sub

# 依次构建
build-all: build-admin build-editor clear-sub
	@echo '构建完成'

# 启动服务
run-server:
	pm2 start process.json --no-daemon --env=docker

# 初始化子模块
init-sub:
	git submodule update --init --recursive

# 更新子模块
update-sub:
	git submodule update

# 构建镜像
docker-build:
	@read -p '输入镜像tag:' version; docker image build -t godspen\:$$version .
