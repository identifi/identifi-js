'use strict';

//Identifiers service used to communicate Identifiers REST endpoints
angular.module('identifiers').factory('Identifiers', ['$resource',
	function($resource) {
		return $resource('api/id/:idType/:idValue/:method', {
		}, {
			connections: {
        action: 'GET',
        params: { method: 'connections' },
				isArray: true
			},
			sent: {
        action: 'GET',
        params: { method: 'sent' },
				isArray: true
			},
			received: {
        action: 'GET',
        params: { method: 'received' },
				isArray: true
			},
			trustpaths: {
        action: 'GET',
        params: { method: 'trustpaths' },
				isArray: true
			},
			getname: {
        action: 'GET',
        params: { method: 'getname' }
			},
			connectingmsgs: {
        action: 'GET',
        params: { method: 'connectingmsgs' },
				isArray: true
			}
		});
	}
]);
