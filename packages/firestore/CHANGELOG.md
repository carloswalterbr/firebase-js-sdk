# Unreleased
- [changed] Removed eval()-based fallback for JSON parsing, allowing SDK to
  be used in environments that prohibit eval().

# 0.8.3
- [fixed] Fixed an issue that prevented query synchronization between multiple
  tabs.

# 0.8.2
- [fixed] Fixed an issue where native ES6 module loading was not working.

# 0.8.1
- [fixed] Fixed an issue where typings are created in the wrong location.

# 0.8.0
- [feature] Access to offline persistence is no longer limited to a single tab.
  You can opt into this new experimental mode by invoking `enablePersistence()`
  with `{experimentalTabSynchronization: true}`. All tabs accessing persistence
  must use the same setting for this flag.
- [fixed] Fixed an issue where the first `get()` call made after being offline
  could incorrectly return cached data without attempting to reach the backend.
- [changed] Changed `get()` to only make one attempt to reach the backend before
  returning cached data, potentially reducing delays while offline.
- [fixed] Fixed an issue that caused Firebase to drop empty objects from calls
  to `set(..., { merge: true })`.
- [changed] Improved argument validation for several API methods.

# 0.7.3
- [changed] Changed the internal handling for locally updated documents that
  haven't yet been read back from Firestore. This can lead to slight behavior
  changes and may affect the `SnapshotMetadata.hasPendingWrites` metadata flag.
- [changed] Eliminated superfluous update events for locally cached documents
  that are known to lag behind the server version. Instead, we buffer these
  events until the client has caught up with the server.
  
# 0.7.2
- [fixed] Fixed a regression that prevented use of Firestore on ReactNative's
  Expo platform (#1138).

# 0.7.0
- [fixed] Fixed `get({source: 'cache'})` to be able to return nonexistent
  documents from cache.
- [changed] Prepared the persistence layer to allow shared access from multiple
  tabs. While this feature is not yet available, all schema changes are included
  in this release. Once you upgrade, you will not be able to use an older version
  of the Firestore SDK with persistence enabled.
- [fixed] Fixed an issue where changes to custom authentication claims did not
  take effect until you did a full sign-out and sign-in.
  (firebase/firebase-ios-sdk#1499)

# 0.6.1
- [changed] Improved how Firestore handles idle queries to reduce the cost of
  re-listening within 30 minutes.
- [changed] Improved offline performance with many outstanding writes.

# 0.6.0
- [fixed] Fixed an issue where queries returned fewer results than they should,
  caused by documents that were cached as deleted when they should not have
  been (firebase/firebase-ios-sdk#1548). Because some cache data is cleared,
  clients might use extra bandwidth the first time they launch with this
  version of the SDK.
- [feature] Added `firebase.firestore.FieldValue.arrayUnion()` and
  `firebase.firestore.FieldValue.arrayRemove()` to atomically add and remove
  elements from an array field in a document.
- [feature] Added `'array-contains'` query operator for use with `.where()` to
  find documents where an array field contains a specific element.

# 0.5.0
- [changed] Merged the `includeQueryMetadataChanges` and
  `includeDocumentMetadataChanges` options passed to `Query.onSnapshot()` into
  a single `includeMetadataChanges` option.
- [changed] `QuerySnapshot.docChanges()` is now a method that optionally takes
  an `includeMetadataChanges` option. By default, even when listening to a query
  with `{ includeMetadataChanges:true }`, metadata-only document changes are
  suppressed in `docChanges()`.
- [feature] Added new `{ mergeFields: (string|FieldPath)[] }` option to `set()`
  which allows merging of a reduced subset of fields.

# 0.4.1
- [fixed] Fixed a regression in Firebase JS release 4.13.0 regarding the
  loading of proto files, causing Node.JS support to break.

# 0.4.0
- [feature] Added a new `Timestamp` class to represent timestamp fields,
  currently supporting up to microsecond precision. It can be passed to API
  methods anywhere a JS Date object is currently accepted. To make
  `DocumentSnapshot`s read timestamp fields back as `Timestamp`s instead of
  Dates, you can set the newly added flag `timestampsInSnapshots` in
  `FirestoreSettings` to `true`. Note that the current behavior
  (`DocumentSnapshot`s returning JS Date objects) will be removed in a future
  release. `Timestamp` supports higher precision than JS Date.
- [feature] Added ability to control whether DocumentReference.get() and
  Query.get() should fetch from server only, (by passing { source: 'server' }),
  cache only (by passing { source: 'cache' }), or attempt server and fall back
  to the cache (which was the only option previously, and is now the default).

# 0.3.7
- [fixed] Fixed a regression in the Firebase JS release 4.11.0 that could
  cause get() requests made while offline to be delayed by up to 10
  seconds (rather than returning from cache immediately).

# 0.3.6
- [fixed] Fixed a regression in the Firebase JS release 4.11.0 that could
  cause a crash if a user signs out while the client is offline, resulting in
  an error of "Attempted to schedule multiple operations with timer id
  listen_stream_connection_backoff".

# 0.3.5
- [changed] If the SDK's attempt to connect to the Cloud Firestore backend
  neither succeeds nor fails within 10 seconds, the SDK will consider itself
  "offline", causing get() calls to resolve with cached results, rather than
  continuing to wait.
- [fixed] Fixed a potential race condition after calling `enableNetwork()` that
  could result in a "Mutation batchIDs must be acknowledged in order" assertion
  crash.

# 0.3.2
- [fixed] Fixed a regression in Firebase JS release 4.9.0 that could in certain
  cases result in an "OnlineState should not affect limbo documents." assertion
  crash when the client loses its network connection.

# 0.3.1
- [changed] Snapshot listeners (with the `includeMetadataChanges` option
  enabled) now receive an event with `snapshot.metadata.fromCache` set to
  `true` if the SDK loses its connection to the backend. A new event with
  `snapshot.metadata.fromCache` set to false will be raised once the
  connection is restored and the query is in sync with the backend again.
- [feature] Added `SnapshotOptions` API to control how DocumentSnapshots
  return unresolved server timestamps.
- [feature] Added `disableNetwork()` and `enableNetwork()` methods to
  `Firestore` class, allowing for explicit network management.
- [changed] For non-existing documents, `DocumentSnapshot.data()` now returns
  `undefined` instead of throwing an exception. A new
  `QueryDocumentSnapshot` class is introduced for Queries to reduce the number
  of undefined-checks in your code.
- [added] Added `isEqual` API to `GeoPoint`, `Blob`, `SnapshotMetadata`,
  `DocumentSnapshot`, `QuerySnapshot`, `CollectionReference`, `FieldValue`
  and `FieldPath`.
- [changed] A "Could not reach Firestore backend." message will be
  logged when the initial connection to the Firestore backend fails.
- [changed] A "Using maximum backoff delay to prevent overloading the
  backend." message will be logged when we get a resource-exhausted
  error from the backend.

# v0.2.1
- [feature] Added Node.js support for Cloud Firestore (with the exception of
  the offline persistence feature).
- [changed] Webchannel requests use $httpHeaders URL parameter rather than
  normal HTTP headers to avoid an extra CORS preflight request when initiating
  streams / RPCs.

# v0.1.4
- [changed] Network streams are automatically closed after 60 seconds of
  idleness.
- [changed] We no longer log 'RPC failed' messages for expected failures.

# v0.1.2
- [changed] We now support `FieldValue.delete()` sentinels in `set()` calls
  with `{merge:true}`.
- [fixed] Fixed validation of nested arrays to allow indirect nesting

# v0.1.1
- [fixed] Fixed an issue causing exceptions when trying to use
  `firebase.firestore.FieldPath.documentId()` in an `orderBy()` or `where()`
  clause in a query.

# v0.1.0
- Initial public release.
