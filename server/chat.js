//chat
Chat = {};
//Used to transform [[itemId]] into special mouseover info
Chat.parse = function(data){
	
	//Item [[item.id]]
	for(var i = 0 ; i < data.length ; i++){
		if(data[i] == '[' && data[i+1] == '['){
			var start = i;
			for(var j = start; j < data.length ; j++){
				if(data[j] == ']' && data[j+1] == ']'){
					var id = data.slice(start+2,j);
					
					var item = Db.item[id];
					
					if(item){
						if(item.type == 'armor' || item.type == 'weapon'){
							var str = '<span ' + 
							'style="color:' + 'green' + '" ' +
							'onclick="popupList.equip = \'' + item.id + '\';' + '" ' + 
							'onmouseout="popupList.equip = null;' + '" ' + 
							'>[[' + item.name + 
							']]</span>';
							
							data = data.replaceAll('\\[\\[' + id + '\\]\\]',str	);
								
						}
					}
					break;
				}
			}
		}
	}
	
	
	return data;
}

//add text to chat of player.
Chat.add = function(key,type,text,extra){
	List.main[key].chatBox = List.main[key].chatBox || [];
    extra = extra || {};
	if(text === undefined){ text = type; type = 'game';}
	
	extra.text = text;
	extra.type = type;
	
	List.main[key].chatBox.push(extra);	
}

//when a player wants to send a text
Chat.send = function(data){
	var key = data.key;
	var text = Chat.parse(customEscape(data.text));      //text
	var to = customEscape(data.to);                     //destination
	var type = customEscape(data.type);                 //clan || pm || public
	var from = List.all[key].name;                      //source
			
	if(!type || !text || !to || !from){ return; }
	if(to === from){ Chat.add(key,"Ever heard of thinking in your head?"); return; }
	
	if(type === 'public') Chat.send.public(key,text,to,type,from,data); 
	if(type === 'pm') Chat.send.pm(key,text,to,type,from,data); 
	if(type === 'clan') Chat.send.clan(key,text,to,type,from,data); 
		
};

Chat.send.public = function(key,text,to,type,from,data){
    if(text === data.text){
		List.all[key].chatHead = {'text':text,'timer':25*10};
	}
	for(var i in List.main){	Chat.add(i,'public',text,{'from':from});}
	return;
}

Chat.send.pm = function(key,text,to,type,from,data){
    Chat.send.pm.test(from,to,(function(res){
		if(res){
			Chat.add(tokey,'pm',text,{'from':from,'to':to});
			Chat.add(key,'pm',text,{'from':from,'to':to});
		}
		if(res === false){
			Chat.add(key,"This player is offline.");
		} 
		if(res === ''){
			Chat.add(key,"This player doesn't exist.");
		}	
	}));
	return
}

//test if player can send pm to another. check for online but also mute list
Chat.send.pm.test = function(from,to,cb){
	db.account.find({username:to},function(err, r) {
		
		if(r[0]){	//aka exist
			var bool = r[0].id;
			
			if(!List.main[r[0].id]){ bool = false; } else {
				if(List.main[r[0].id].pm == 'off'){ bool = false; }
				if(List.main[r[0].id].pm == 'friend'){ 
					if(!List.main[r[0].id].friendList[from]){ bool = false; }				
				}
			}
			cb(bool,from,to);
		}
		if(!r[0]){ cb('');  }
	});	
}

Chat.send.pm.clan = function(key,text,to,type,from,data){
    var clanName = List.main[key].clanList[+to];
    		
    if(!clanName){ Chat.add(key,'You typed too many \"/\".'); return; }
    var clan = Db.clan[clanName];
    if(!clan){ Chat.add(key,'This clan doesn\'t exist. Strange...'); return; }
    
    for(var i in clan.memberList){	
    	if(clan.memberList[i].active && List.nameToKey[i]){
    		Chat.add(List.nameToKey[i],'clan',text,{'from':[clan.nick,from]});
    	}
    }
    return;
}    

//server receives information from client that wishes to send a message
io.sockets.on('connection', function (socket) {
	socket.on('sendChat', function (data) {
		data.key = socket.key;
		Chat.send(data);
	})
});







































