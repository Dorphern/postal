export const Action = {
  Login: { path: 'login', method: 'POST' },
  Sync: { path: 'sync', method: 'GET' },
  CreateRoom: { path: 'createRoom', method: 'POST' },
  FetchProfile: ({ userId }) => ({ path: `profile/${userId}`, method: 'GET' }),
  UpdateDirect: ({ authId }) => ({
    path: `user/${authId}/account_data/m.direct`,
    method: 'PUT',
  }),
  FetcDirect: ({ authId }) => ({
    path: `user/${authId}/account_data/m.direct`,
    method: 'GET',
  }),
  UpdateReadMarker: ({ roomId, eventId }) => ({
    path: `rooms/${roomId}/receipt/m.read/${eventId}`,
    method: 'POST',
  }),
}
