/**
 * Copyright 2017 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { expect } from 'chai';
import * as firestore from 'firestore';
import * as testHelpers from '../../util/helpers';
import { EventsAccumulator } from '../../util/helpers';
import * as integrationHelpers from '../util/helpers';

const asyncIt = testHelpers.asyncIt;
const apiDescribe = integrationHelpers.apiDescribe;

apiDescribe('Smoke Test', persistence => {
  asyncIt('can write a single document', () => {
    return integrationHelpers.withTestDoc(persistence, ref => {
      return ref.set({
        name: 'Patryk',
        message: 'We are actually writing data!'
      });
    });
  });

  asyncIt('can read a written document', () => {
    return integrationHelpers.withTestDoc(persistence, ref => {
      const data = {
        name: 'Patryk',
        message: 'We are actually writing data!'
      };
      return ref
        .set(data)
        .then(() => {
          return ref.get();
        })
        .then((doc: firestore.DocumentSnapshot) => {
          expect(doc.data()).to.deep.equal(data);
        });
    });
  });

  asyncIt('can read a written document with DocumentKey', () => {
    return integrationHelpers.withTestDb(persistence, db => {
      const ref1 = db.doc('rooms/eros/messages/2');
      const ref2 = db.doc('users/patryk');
      const data = { user: ref2, message: 'We are writing data' };
      return ref2.set({ name: 'patryk' }).then(() => {
        return ref1
          .set(data)
          .then(() => {
            return ref1.get();
          })
          .then((doc: firestore.DocumentSnapshot) => {
            const recv = doc.data();
            expect(recv['message']).to.deep.equal(data.message);
            const user = recv['user'];
            // Make sure it looks like a DocumentRef.
            expect(user.set).to.be.an.instanceof(Function);
            expect(user.onSnapshot).to.be.an.instanceof(Function);
            expect(user.id).to.deep.equal(ref2.id);
          });
      });
    });
  });

  asyncIt('will fire local and remote events', () => {
    return integrationHelpers.withTestDbs(
      persistence,
      2,
      ([reader, writer]) => {
        const readerRef = reader.doc('rooms/eros/messages/1');
        const writerRef = writer.doc('rooms/eros/messages/1');
        const data = {
          name: 'Patryk',
          message: 'We are actually writing data!'
        };

        const accum = new EventsAccumulator<firestore.DocumentSnapshot>();
        return writerRef.set(data).then(() => {
          const unlisten = readerRef.onSnapshot(accum.storeEvent);
          return accum
            .awaitEvent()
            .then(docSnap => {
              expect(docSnap.exists).to.equal(true);
              expect(docSnap.data()).to.deep.equal(data);
            })
            .then(() => unlisten(), () => unlisten());
        });
      }
    );
  });

  asyncIt('will fire value events for empty collections', () => {
    return integrationHelpers.withTestDb(persistence, db => {
      const collection = db.collection('empty-collection');

      const accum = new EventsAccumulator<firestore.QuerySnapshot>();
      const unlisten = collection.onSnapshot(accum.storeEvent);
      return accum
        .awaitEvent()
        .then(querySnap => {
          expect(querySnap.empty).to.equal(true);
          expect(querySnap.size).to.equal(0);
          expect(querySnap.docs.length).to.equal(0);
        })
        .then(() => unlisten(), () => unlisten());
    });
  });

  asyncIt('can get collection query', () => {
    const testDocs = {
      '1': {
        name: 'Patryk',
        message: 'We are actually writing data!'
      },
      '2': { name: 'Gil', message: 'Yep!' },
      '3': { name: 'Jonny', message: 'Crazy!' }
    };
    return integrationHelpers.withTestCollection(persistence, testDocs, ref => {
      return ref.get().then(result => {
        expect(result.empty).to.equal(false);
        expect(result.size).to.equal(3);
        expect(testHelpers.toDataArray(result)).to.deep.equal([
          testDocs[1],
          testDocs[2],
          testDocs[3]
        ]);
      });
    });
  });

  // TODO (b/33691136): temporarily disable failed test
  // This broken because it requires a composite index on filter,sort
  xit('can query by field and use order by', () => {
    const testDocs = {
      '1': { sort: 1, filter: true, key: '1' },
      '2': { sort: 2, filter: true, key: '2' },
      '3': { sort: 2, filter: true, key: '3' },
      '4': { sort: 3, filter: false, key: '4' }
    };
    return integrationHelpers.withTestCollection(
      persistence,
      testDocs,
      coll => {
        const query = coll.where('filter', '==', true).orderBy('sort', 'desc');
        return query.get().then(result => {
          expect(testHelpers.toDataArray(result)).to.deep.equal([
            testDocs[2],
            testDocs[3],
            testDocs[1]
          ]);
        });
      }
    );
  });
});