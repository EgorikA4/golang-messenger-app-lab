package service

import (
	"context"
	"log"

	"github.com/EgorikA4/golang-messenger-app-lab/internal/proxyproto"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
)

// check user
func (s *Service) RPC(ctx context.Context, request *proxyproto.RPCRequest) (*proxyproto.RPCResponse, error) {
	userID, err := uuid.Parse(request.User)
	if err != nil {
		return nil, err
	}
	log.Printf("UserID: %s\n", userID)

	user, err := s.storage.GetUserByID(ctx, userID)
	if err == pgx.ErrNoRows {
		log.Println("user does not found")
		return nil, err
	} else if err != nil {
		log.Println("unrecognized error", err)
		return nil, err
	}
	log.Println(user)
	return nil, nil
}

// Connect ...
// subscribe on default channels
func (s *Service) Subscribe(ctx context.Context, request *proxyproto.SubscribeRequest) (*proxyproto.SubscribeResponse, error) {
	log.Println("User connected", request.User, "channel:", request.Channel)
	// account, err := s.storage.GetUserByUsermame(ctx, authRequest.Username)
	// if err != nil {
	// 	return RespondError(101, "unauthorized")
	// }

	// if authRequest.Password != account.Password {
	// 	return RespondError(101, "unauthorized")
	// }

	return nil, nil
	// return &proxyproto.ConnectResponse{
	// 	Result: &proxyproto.ConnectResult{
	// 		User: strconv.FormatInt(account.ID, 10),
	// 	},
	// }, nil
}

// Subscribe ...

// Publish ...
