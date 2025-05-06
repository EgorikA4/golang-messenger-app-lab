package utils

import "github.com/EgorikA4/golang-messenger-app-lab/internal/proxyproto"

func RespondRPCError(code uint32, msg string) (*proxyproto.RPCResponse, error) {
	return &proxyproto.RPCResponse{
		Error: &proxyproto.Error{
			Code:    code,
			Message: msg,
		},
	}, nil
}
