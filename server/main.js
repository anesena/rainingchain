server = true;

//To make shared files work. barely used anymore

ctxList = {
	'stage':{'restore':(function(){}),'fillText':(function(){}),'drawImage':(function(){})},
	'win':{'restore':(function(){}),'fillText':(function(){}),'drawImage':(function(){})},

};
ctx = {'restore':(function(){}),'fillText':(function(){}),'drawImage':(function(){})};

ctxrestore = function(){};

/////
Db = {};
List = {
	all:{},		//EVERYTHING (player id refers to mortal)
	mortal:{},	//all mortals (player,enemy)
	bullet:{},	//all bullet
	anim:{},	//all anim
	strike:{},	//all strike
	group:{},	//all enemy group
	drop:{},	//all drop
	map:{},		//all animation
	main:{},	//all List.main of player. (player id) List.main[id].something on server => window.something on client
	map:{},		//all maps including instance 
	socket:{},	//all socket (player id),
	nameToKey:{},	//used to convert a player name into the player key
};

shopList = {}; //all shop

//Sync DB and Server when Server starts
exports.initServer = function (){
    require('async').series([Init.db.item, Init.db.equip, Init.db.ability,
        (function(){
			Init.db.stat();
			
			
			initAbilityModDb();
			
			Init.db.sprite();
			initShopDb();
			Init.db.dialogue();
			Init.db.map();
			
			Init.db.drop();
			Change.update.init();
			Init.db.boost();
			Init.db.customBoost();
			Init.mortal();
			Init.db.enemy();
			Init.db.boss();
								
			Init.db.quest();
			initLoadMap();
			
			Init.db.passive();
			Init.db.clan();
			initAbiConsDb();
			Test.serverStart();
			setInterval(Loop,40);
		})
	]);
	
	db.account.update({},{'$set':{online:0}},{multi:true},function(err, results) { if(err) throw err });   //set all players offline
}






