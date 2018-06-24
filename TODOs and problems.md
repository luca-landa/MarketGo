# Next TODOs
* using node-rsa package
** ~~mongodb has clients public keys~~
** ~~client paymentRequest message has new format: {event: '', idx: ownClientIdx, signature: someStringEncryptedWithOwnPrivateKey}~~
** ~~server subflow ClientPaymentRequest uses DecryptPaymentRequest to verify signature~~
*** ~~which requests the db for client public key and attempts to decrypt the message~~
** ~~error message on client palmar when signature verification fails~~

* refactoring: private key and signature params are passed to clientPalmar as argument on instantiation
* refactoring: use GetClientInformation subflow

# Before submission
* ~~glitch: on firefox in ubuntu 17.04 VM drag has graphic glitches~~
** ~~workaround: start firefox with "firefox --safe-mode"~~
* insert script to create purchases on db with products in the latest 7 days
** maybe on nodejs startup?
** or in the provisioning script?