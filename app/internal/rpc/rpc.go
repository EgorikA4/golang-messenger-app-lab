package rpc

import (
	"context"

	"github.com/EgorikA4/golang-messenger-app-lab/app/internal/rpc/handlers"
	"github.com/EgorikA4/golang-messenger-app-lab/internal/db"
	"github.com/EgorikA4/golang-messenger-app-lab/internal/proxyproto"
)

var MethodToHandler = map[string]func(context.Context, *db.Queries, *proxyproto.RPCRequest) (*proxyproto.RPCResponse, error){
	"InitUser": handlers.InitUser,
	"GetUserChannelsList": handlers.GetUserChannelsList,
}
