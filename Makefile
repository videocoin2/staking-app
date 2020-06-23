GOOS?=linux
GOARCH?=amd64
GCP_PROJECT?=videocoin-network
NAME=staking
VERSION=$$(git describe --abbrev=0)-$$(git rev-parse --abbrev-ref HEAD)-$$(git rev-parse --short HEAD)
ENV?=dev

REACT_APP_API_URL?=
REACT_APP_GAS_KEY?=
REACT_APP_DELEGATIONS_API_URL?=
REACT_APP_NETWORKS?=

.PHONY: deploy build

default: build

version:
	@echo ${VERSION}

build:
	yarn run build

deps:
	yarn --ignore-optional
	cd src/ui-kit && yarn && cd -

docker-build:
	docker build -t gcr.io/${GCP_PROJECT}/${NAME}:${VERSION} \
	--build-arg REACT_APP_API_URL=${REACT_APP_API_URL} \
	--build-arg REACT_APP_GAS_KEY=${REACT_APP_GAS_KEY} \
	--build-arg REACT_APP_DELEGATIONS_API_URL=${REACT_APP_DELEGATIONS_API_URL} \
	--build-arg REACT_APP_NETWORKS=${REACT_APP_NETWORKS} \
	-f Dockerfile .

docker-push:
	docker push gcr.io/${GCP_PROJECT}/${NAME}:${VERSION}

release: docker-build docker-push

deploy:
	ENV=${ENV} GCP_PROJECT=${GCP_PROJECT} deploy/deploy.sh
