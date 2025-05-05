package service

import "github.com/EgorikA4/golang-messenger-app-lab/internal/proxyproto"

// RespondError ...
func RespondError(code uint32, msg string) (*proxyproto.ConnectResponse, error) {
	return &proxyproto.ConnectResponse{
		Error: &proxyproto.Error{
			Code:    code,
			Message: msg,
		},
	}, nil
}