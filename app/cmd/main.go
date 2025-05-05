package main

import (
	"context"
	"log"
	"net"
	"os"
	"os/signal"

	"github.com/EgorikA4/golang-messenger-app-lab/app/internal/keycloak"
	"github.com/EgorikA4/golang-messenger-app-lab/app/internal/service"
	"github.com/EgorikA4/golang-messenger-app-lab/internal/proxyproto"
	"google.golang.org/grpc"
)

const (
	// TODO: config
	ConnString = "postgres://postgres:RieL4U95xke4@127.0.0.1:5432/backend?sslmode=disable"
)

func main() {
	listener, err := net.Listen("tcp4", ":10000")
	if err != nil {
		log.Fatalln(err)
	}

	keycloak.InitClient()

	errChan := make(chan error)
	srv := grpc.NewServer()

	svc, err := service.New(ConnString)
	if err != nil {
		log.Fatalln(err)
	}

	proxyproto.RegisterCentrifugoProxyServer(srv, svc)

	exitCtx, cancel := signal.NotifyContext(context.Background(), os.Interrupt)
	defer func() {
		if err := recover(); err != nil {
			log.Println(err)
		}

		cancel()
		srv.GracefulStop()
		close(errChan)

		if err := listener.Close(); err != nil {
			log.Println(err)
		}
	}()

	go func() {
		log.Println("started listening...")
		errChan <- srv.Serve(listener)
	}()

	select {
	case err := <-errChan:
		log.Fatalln(err)
	case <-exitCtx.Done():
		log.Println("exit")
	}
}
