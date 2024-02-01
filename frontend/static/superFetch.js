function superFetch(url,data,{method='GET',format,credentials='include'}={}){
	let options={credentials};

	if(method=='GET'){
		if(data)
			url+=[...JSONAsURLEncodedStringIterator(data)].reduce((acc,el)=>acc+=el.join('=')+'&','?');
	}else{
		options.method=method;
		if(whatIs(data)==Types.OBJECT){
			if(data instanceof FormData){
				options.body=data;
			}else{
				options.headers['Content-Type']='application/json';
				options.body=JSON.stringify(data);
			}
		}else if(data)
			options.body=data;
	}

	return format?
		(fetch(url,options).then(res=>res[format]()))
		:fetch(url,options);
}

export { superFetch }