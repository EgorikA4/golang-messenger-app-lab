FROM golang:1.24.2-alpine3.21 AS builder

ENV GOCACHE=/root/.cache/go-build

WORKDIR /code

COPY . .
RUN go mod tidy
RUN go build -o app ./services/pubsub/cmd/main.go

FROM alpine:3.21

WORKDIR /myapp

COPY --from=builder /code/app ./

EXPOSE 10000

CMD [ "/myapp/app" ]