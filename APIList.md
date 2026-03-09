#Dev Tinder APIs

##authRouter
-POST /signip
-POST /login
-POST /logout 

##profileRouter
-GET /profile/view
-PATCH /profile/edit
-PATCH /profile/password

##connnectionRequestRouter
-POST /request/send/interested/:userId
-POST /request/send/ignored/:userId
-POST /request/review/accepted/:requestId
-POST /request/review/rejected/:requestId

##userRouter
-GET /user/connections
-GET /user/requests/received
-GET /user/feed -gets you profile of other user 


Status : ignore, interested , accepted , rejected 
