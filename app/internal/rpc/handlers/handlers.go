package handlers

import (
	"context"
	"encoding/json"
	"log"

	"github.com/EgorikA4/golang-messenger-app-lab/app/internal/keycloak"
	"github.com/EgorikA4/golang-messenger-app-lab/app/internal/utils"
	"github.com/EgorikA4/golang-messenger-app-lab/internal/db"
	"github.com/EgorikA4/golang-messenger-app-lab/internal/proxyproto"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
)

func InitUser(ctx context.Context, storage *db.Queries, request *proxyproto.RPCRequest) (*proxyproto.RPCResponse, error) {
	userID, err := uuid.Parse(request.User)
	if err != nil {
		return utils.RespondRPCError(101, err.Error())
	}

	_, err = storage.GetUserByID(ctx, userID)
	if err == pgx.ErrNoRows {
		token, err := keycloak.Client.LoginClient(ctx, "backend", "ouX5fdKsbcNOJjCxL2zGjUlfPB8VTRoV", "messenger")
		if err != nil {
			log.Println("Error with token (login client)")
			return utils.RespondRPCError(101, err.Error())
		}
		userInfo, err := keycloak.Client.GetUserByID(ctx, token.AccessToken, "messenger", userID.String())
		if err != nil {
			log.Println("Error with get user by id")
			return utils.RespondRPCError(101, err.Error())
		}
		createUserParams := db.CreateUserParams{
			ID:         userID,
			Username:   *userInfo.Username,
			GivenName:  *userInfo.FirstName,
			FamilyName: *userInfo.LastName,
			Enabled:    *userInfo.Enabled,
		}
		if err := storage.CreateUser(ctx, createUserParams); err != nil {
			log.Println("Error with create user")
			return utils.RespondRPCError(101, err.Error())
		}

		if err := storage.SubscribeUserOnDefaultChans(ctx, userID); err != nil {
			log.Println("Error with subscribe user on default chans")
			return utils.RespondRPCError(101, err.Error())
		}
		return nil, nil
	}
	return nil, err
}

func GetUserChannelsList(ctx context.Context, storage *db.Queries, request *proxyproto.RPCRequest) (*proxyproto.RPCResponse, error) {
	userID, err := uuid.Parse(request.User)
	if err != nil {
		log.Println("Error with parse uuid")
		return utils.RespondRPCError(101, err.Error())
	}
	chanList, err := storage.ChanListByUserID(ctx, userID)
	if err != nil {
		log.Println("Error with get channels list by user id")
		return utils.RespondRPCError(101, err.Error())
	}

	type ChanResponse struct {
		Channel string
		Title   string
	}

	channelsListResponse := make([]ChanResponse, 0, len(chanList))
	for _, channel := range chanList {
		channelsListResponse = append(channelsListResponse, ChanResponse{
			Channel: channel.Channel,
			Title:   channel.Title,
		})
	}

	data, err := json.Marshal(channelsListResponse)
	if err != nil {
		log.Println("Error while marshal json")
		return utils.RespondRPCError(101, err.Error())
	}

	return &proxyproto.RPCResponse{
		Result: &proxyproto.RPCResult{
			Data: data,
		},
	}, nil
}
