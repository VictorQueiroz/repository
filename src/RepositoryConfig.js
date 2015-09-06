function RepositoryConfig (config) {
	if(!config.name) {
		throw new Error('Invalid resource name');
	}

	if(config.dataProvider instanceof DataProvider === false) {
		throw new Error('Invalid data provider');
	}

	util.extend(this, config);
}