package keycloak

import (
	"sync"

	"github.com/Nerzal/gocloak/v13"
)

var (
	Client         *gocloak.GoCloak
	initCloakClientOnce sync.Once
)

func InitClient() {
	initCloakClientOnce.Do(func() {
		Client = gocloak.NewClient("http://localhost:8090")
	})
}
