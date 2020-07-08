FROM node:14-alpine as builder

ARG REACT_APP_API_URL
ARG REACT_APP_GAS_KEY
ARG REACT_APP_DELEGATIONS_API_URL
ARG REACT_APP_NETWORKS
ARG REACT_APP_TOKEN_ADDRESS
ARG REACT_APP_ESCROW_ADDRESS
ARG REACT_APP_STORE_CONFIG

RUN apk add --no-cache --virtual .gyp \
        build-base \
        git \
        libc6-compat \
        openssh-client \
        python \
        make \
        g++

RUN apk upgrade libcurl

COPY . /ui
WORKDIR /ui
RUN make deps && make build

FROM nginx:1.11.8-alpine
COPY --from=builder /ui/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]