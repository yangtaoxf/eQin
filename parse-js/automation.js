var Parse = require('parse/node');
var mqtt = require('mqtt')
var client  = mqtt.connect('mqtt://115.159.98.171:1883')

Parse.initialize("r5em6wDjRffPNR6900ll9leu0T1sZP8t2TCZbPrI", "sLj9Qhu8Lj3ea21kxpMBHNaRGUqSjJqXPE3dDtBH");

Parse.serverURL = 'http://47.101.66.229:1337/parse';

// const UserData = Parse.Object.extend("UserData");
// const UserDevice = Parse.Object.extend("UserDevice");

// const query = new Parse.Query(UserDevice);
// const p = new Parse.Query('UserDevice')
// const subscription = p.subscribe();


// subscription.on('open', () => {
//     console.log('subscription opened');
// });

// subscription.on("error", (all)=>{
//     console.log("subscription error")
// })

// subscription.on("create", (object)=> {
//     console.log("[subscription:onCreate] topic:"+object.get("topic"))
//     client.end()
//     client.reconnect()
// })

// subscription.on('delete', (object) => {
//     console.log("[subscription:onDelete] topic:"+object.get("topic"))
//     client.end()
//     client.reconnect()
// });

// client.on("connect", (msg)=>{
//     console.log("connecting...")
//     var results = query.find();
//     results.then((data)=>{
//         for(i = 0; i < data.length; i++){
//            let topic = data[i].get("topic");
//            client.subscribe(topic, (err)=>{
//                if(!err){
//                    console.log("[client:onConnect] topic:  "+topic+"  connected");
//                }
//            })
//         }
//     },(error)=>{
//         console.log(error)
//     })
// })

// client.on("message", (topic, message) => {
//     var now = new Date().getSeconds();
//     if(now%30==0){
//         console.log("[client:onMessage] "+topic+" : "+message)
//         var parts = topic.split("/");
//         var type = parts[1];
//         var msg = JSON.parse(message);
//         const dataItem = new UserData();
//         dataItem.set("topic",topic);

//         dataItem.set("data", msg[type]);
//         dataItem.set("date", new Date().getTime);
//         dataItem.save().then((dataItem) => {
//             console.log("[parse:save]"+ dataItem.id)
//         }, (error)=> {
//             console.log("error"+ error)
//         })
//     }
// })

const UserAutomation = Parse.Object.extend("UserAutomation");
var automationList = []
const query = new Parse.Query(UserAutomation)

client.on("connect", ()=>{
    query.find().then((objects)=>{
        for(var i = 0; i < objects.length; i++){
            var sourceTopic = objects[i].get('sourceTopic');
            var condition = objects[i].get('condition');
            var type = objects[i].get('type');
            var targetTopic = objects[i].get('targetTopic');
            var operation = objects[i].get('operation');
            var automation = {
                type,
                sourceTopic,
                condition,
                targetTopic,
                operation,
                done: false
            }
            automationList.push(automation);
        }
        queryCallBack()
    })
})


function queryCallBack(){
    for(var i = 0; i < automationList.length; i++){
        let a = automationList[i];
        client.subscribe(a.sourceTopic, (error) => {
            if(error == null){
                console.log("[client sub] "+a.sourceTopic+" successfully");
            }
        });
    }
}

function isTopicInUse(topic){
    for(let i = 0; i < automationList.length; i++){
        if(automationList[i].sourceTopic === topic)
            return i;
    }
    return null;
}

client.on("message", (topic, msg) =>{
    let inUse =  isTopicInUse(topic);
    let automationItem = automationList[inUse];
    var msg = JSON.parse(msg);
    
    if(automationItem){
        console.log(msg)
        let condition = eval(msg['temperature']+automationItem.condition);
        if(condition){
            if(automationItem.type==="info"){
                if(!automationItem.done){
                    automationItem.done = true;
                    console.log("通知")
                }
            }else if(automationItem.type === "operation"){
                if(!automationItem.done){
                    client.publish(automationItem.targetTopic, automationItem.operation)
                }
            }
        }else{
            automationItem.done = false;
        }
    }
})


