# Next TODOs
* using node-rsa package
** ~~mongodb has clients public keys~~
** ~~client paymentRequest message has new format: {event: '', idx: ownClientIdx, signature: someStringEncryptedWithOwnPrivateKey}~~
** server subflow ClientPaymentRequest uses DecryptPaymentRequest to decrypt request
*** which requests the db for client public key and attempts to decrypt the message
*** if the decryption fails with an error, or the JSON parse fails with an error, the flows returns null

* refactoring: private key and signature params are passed to clientPalmar as argument on instantiation


# Before submission
* ~~glitch: on firefox in ubuntu 17.04 VM drag has graphic glitches~~
** ~~workaround: start firefox with "firefox --safe-mode"~~
* insert script to create purchases on db with products in the latest 7 days
** maybe on nodejs startup?
** or in the provisioning script?