export function getAnatomicalSiteList(token) {
    const headers = {
        Authorization: `JWT ${token}`,
    };

    const anatomicalSites = ['Left Arm', 'Left Leg', 'Right Arm', 'Right Leg',
        'Stomach', 'Back', 'Neck'];

    return (cursor) => {
        cursor.set({ data: anatomicalSites, status: 'Succed' });
    };
}

export function getRacesList(token) {
    const headers = {
        Authorization: `JWT ${token}`,
    };

    const races = ['Native Hawaiian', 'Pacific Islander', 'Native Hawaiian/Pacific Islander',
        'Race 4', 'Race 5', 'Race 6', 'Race 7'];

    return (cursor) => {
        cursor.set({ data: races, status: 'Succed' });
    };
}
