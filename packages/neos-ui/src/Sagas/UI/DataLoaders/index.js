import {takeLatest, takeEvery} from 'redux-saga';
import {put, select, fork} from 'redux-saga/effects';
import {$get} from 'plow-js';
import {iframeDocument} from '../../../Containers//ContentCanvas/Helpers/dom';

import {actionTypes, actions, selectors} from '@neos-project/neos-ui-redux-store';

function * handleInitialize({globalRegistry}) {
    const dataLoadersRegistry = globalRegistry.get('dataLoaders');
    yield * takeEvery(actionTypes.UI.DataLoaders.INITIALIZE, function * initializeDataLoader(action) {
        const {dataLoaderIdentifier, dataLoaderOptions} = action.payload;

        const dataLoaderDefinition = dataLoadersRegistry.get(dataLoaderIdentifier);
        const state = yield select();
        const cacheSegment = dataLoaderDefinition.makeCacheSegmentSelector(dataLoaderOptions)(state);

        // ensure currentlySelectedDataIdentifiers is always an array
        let currentlySelectedDataIdentifiers = action.payload.currentlySelectedDataIdentifier;
        if (!Boolean(currentlySelectedDataIdentifiers)) {
            currentlySelectedDataIdentifiers = [];
        } else if (!Array.isArray(currentlySelectedDataIdentifiers)) {
            currentlySelectedDataIdentifiers = [currentlySelectedDataIdentifiers];
        }

        // check which data-item is already loaded and figure out which ones are missing
        let dataIdentifiersWhichNeedToBeLoaded = [];
        for (const identifier of currentlySelectedDataIdentifiers) {
            const value = $get(['ui', 'dataLoaders', cacheSegment, 'valuesByIdentifier', identifier], state);
            if (!value) {
                dataIdentifiersWhichNeedToBeLoaded.push(identifier);
            }
        }

        // load the missing items
        const results = yield dataLoaderDefinition.loadItemsByIds(dataLoaderOptions, dataIdentifiersWhichNeedToBeLoaded);

        if (results) {
            // integrate the items in the store
            yield put(actions.UI.DataLoaders.sagaResultsLoaded(cacheSegment, results))
        }


    });
}

function * handleSearch({globalRegistry}) {
    const dataLoadersRegistry = globalRegistry.get('dataLoaders');

    // TODO:let inFlightRequests = {};

    yield * takeEvery(actionTypes.UI.DataLoaders.SEARCH, function * initializeDataLoader(action) {

        // TODO: add delay here for debouncing!!!
        const {dataLoaderIdentifier, dataLoaderOptions, instanceId, searchTerm} = action.payload;

        const dataLoaderDefinition = dataLoadersRegistry.get(dataLoaderIdentifier);
        const state = yield select();
        const cacheSegment = dataLoaderDefinition.makeCacheSegmentSelector(dataLoaderOptions)(state);

        if ($get(['ui', 'dataLoaders', cacheSegment, 'searchStrings', searchTerm], state)) {
            // nothing to be done; the data already exists for the search string.
            return;
        }

        // do the search
        const results = yield dataLoaderDefinition.search(dataLoaderOptions, searchTerm);

        if (results) {
            // integrate the items in the store
            yield put(actions.UI.DataLoaders.sagaResultsLoaded(cacheSegment, results, searchTerm))
        }
    });
}

export const sagas = [
    handleInitialize,
    handleSearch
];
