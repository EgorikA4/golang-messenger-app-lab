package service

import (
	"context"

	"github.com/EgorikA4/golang-messenger-app-lab/app/internal/rpc"
	"github.com/EgorikA4/golang-messenger-app-lab/internal/db"
	"github.com/EgorikA4/golang-messenger-app-lab/internal/proxyproto"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
)

func (s *Service) RPC(ctx context.Context, request *proxyproto.RPCRequest) (*proxyproto.RPCResponse, error) {
	handler, ok := rpc.MethodToHandler[request.Method]
	if !ok {
		return &proxyproto.RPCResponse{
			Error: &proxyproto.Error{
				Code:    400,
				Message: "method does not implemented",
			},
		}, nil
	}
	return handler(ctx, s.storage, request)
}

func (s *Service) Subscribe(ctx context.Context, request *proxyproto.SubscribeRequest) (*proxyproto.SubscribeResponse, error) {
	// TODO: implement
	return nil, nil
}

func (s *Service) Publish(ctx context.Context, request *proxyproto.PublishRequest) (*proxyproto.PublishResponse, error) {
	userID, err := uuid.Parse(request.User)
	if err != nil {
		return &proxyproto.PublishResponse{
			Error: &proxyproto.Error{
				Code:    101,
				Message: err.Error(),
			},
		}, nil
	}

	userCanPublishParams := db.UserCanPublishParams{
		UserID:  userID,
		Channel: request.Channel,
	}

	userCanPublish, err := s.storage.UserCanPublish(ctx, userCanPublishParams)
	if err == pgx.ErrNoRows || (err == nil && !userCanPublish) {
		return &proxyproto.PublishResponse{
			Error: &proxyproto.Error{
				Code:    103,
				Message: "You do not have permissions to publish to this channel",
			},
		}, nil
	} else if err != nil {
		return &proxyproto.PublishResponse{
			Error: &proxyproto.Error{
				Code:    101,
				Message: err.Error(),
			},
		}, nil
	}
	return &proxyproto.PublishResponse{
		Result: &proxyproto.PublishResult{},
	}, nil
}
