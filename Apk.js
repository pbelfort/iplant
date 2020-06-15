import * as React from 'react';
import { YellowBox,Button, View, Text,Switch, StyleSheet, Image, TextInput, BackHandler, Alert, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Header, LearnMoreLinks, Colors, DebugInstructions, ReloadInstructions } from 'react-native/Libraries/NewAppScreen';
import firebase from 'firebase';
import {initApp} from '../App.js'
import { LineChart, XAxis,BarChart, Grid } from 'react-native-svg-charts'
initApp();

YellowBox.ignoreWarnings(['Setting a timer', 'Module RCTImageLoader']);

var date = new Date().getDate();
var month = new Date().getMonth() + 1;
var year = new Date().getFullYear();

var refDate;

var umid;
var temp;
var nMonth;
var nDate;
const fill = 'rgb(0, 255, 0)';
const dataUmidity = [];
const dataTemperature = [];

if(month < 10)
  nMonth = '0'+month;
else
  nMonth = month;

if(date < 10)
  nDate = '0'+date;
if(date >= 10)  
  nDate = date;

refDate = year + '-' +nMonth + '-' + nDate;

var ref = firebase.database().ref(refDate);

ref.once("value")
.then(function(snapshot) {
  var temperatura = snapshot.child("Temperatura").val();
  temp = temperatura;
});

ref.once("value")
.then(function(snapshot) {
  var umidity = snapshot.child("Umidade").val();
  umid = umidity;
});

ref.child("VetorUmidade").once("value").then(function(snapshot){
  snapshot.forEach(function(item){
    var itemVal = item.val();
    if(itemVal != "null")
      dataUmidity.push(itemVal);
  })});

  ref.child("VetorTemperatura").once("value").then(function(snapshot){
    snapshot.forEach(function(item){
      var itemVal = item.val();
      if(itemVal != "null")
         dataTemperature.push(itemVal);
    })});

function HomeScreen({ navigation }) {
  const [email, onChangeEmail] = React.useState('');
  const [password, onChangePassword] = React.useState('');
  const user = firebase.auth();  
  return (
  <View style={styles.body}>
    <View style={styles.sectionContainer}>
    <Image style={styles.logo} source={require('./imgs/iPlant.png')}/>
    </View>
    <View style={styles.txtInp}>
    <TextInput placeholderTextColor='white' underlineColorAndroid="transparent" placeholder="   Login" style={styles.inputText}
     onChangeText={text => onChangeEmail(text)}
     value={email}
     />
    <TextInput placeholderTextColor='white' underlineColorAndroid="transparent" secureTextEntry={true} placeholder="   Password" style={styles.inputText} 
    onChangeText={text => onChangePassword(text)}
    value={password}
    />   
      <View style = {styles.btn} >
      <Button color="#85bb04" title="Entrar" onPress={() => {  signIn(); } } />
      </View>  
    </View>
  </View>
  );

function signIn () {
  if( email === '' || password === '' ) {
    alert("Campo de Email/Senha vazio. Favor inserir credenciais de acesso!");    
      }else{
        user.signInWithEmailAndPassword(email, password).catch(function(error) {
          var errorCode = error.code;
          var errorMessage = error.message;
          if (errorCode === 'auth/wrong-password') {
            alert('Wrong password.');
          } else {
            alert(errorMessage);
          }
        });
      }
      user.onAuthStateChanged(
        (currentUser) =>{
          if(currentUser){
            navigation.navigate('PricipalScreen');
          }else{
            navigation.navigate('HomeScreen');
          }
        }
      ); 
    } //Fim login
} //Fim HomeScreen

function PricipalScreen({ navigation }) {
  return (
    <View style={{
      flex: 1,
      flexDirection: 'column',
      justifyContent: 'space-between',
    }}>
      <View style={{width: '100%', height: '33%', backgroundColor: '#997341'}} >
      <View style={{alignItems:"center"}}><Text style={ { fontSize: 25 } }>Umidity Graphic</Text></View>
      <View style={{ height: 200, padding: 20 }}>
                <LineChart
                    style={{ flex: 1 }}
                    data={dataUmidity}
                    gridMin={0}
                    contentInset={{ top: 10, bottom: 10 }}
                    svg={{ stroke: fill }}
                >
                    <Grid />
                </LineChart>
                <XAxis
                    style={{ marginHorizontal: -10 }}
                    data={dataUmidity}
                    formatLabel={(value, index) => index }
                    contentInset={{ left: 10, right: 10 }}
                    svg={{ fontSize: 10, fill: 'white' }}
                />
            </View>
      </View>

      <View style={{width: '100%', height: `33%`, backgroundColor: '#cc7400'}} >
      <View style={{alignItems:"center"}}><Text style={ { fontSize: 25 } }>Temperature Graphic</Text></View>
      <View style={{ height: 200, padding: 20 }}>
                <LineChart
                    style={{ flex: 1 }}
                    data={dataTemperature}
                    gridMin={0}
                    contentInset={{ top: 10, bottom: 10 }}
                    svg={{ stroke: fill }}
                >
                    <Grid />
                </LineChart>
                <XAxis
                    style={{ marginHorizontal: -10 }}
                    data={dataTemperature}
                    formatLabel={(value, index) => index}
                    contentInset={{ left: 10, right: 10 }}
                    svg={{ fontSize: 10, fill: 'white' }}
                />
            </View>
      </View>
      <View style={{width: '100%', height: `33%`, backgroundColor: 'steelblue'}} >
      <View style={{flex: 1, flexDirection: 'row'}}>
      <View style={{width: "50%", height: "100%", backgroundColor: '#defb99', alignItems:"center"}} >
        <TouchableOpacity onPress={() => { navigation.navigate('InfoCulture1'); } }>
        <Text  style={ { fontSize: 25 } }> Culture 1 </Text>
        </TouchableOpacity>
        <Image style={{width: "60%", height: "60%", marginTop:"15%"}} source={require('./imgs/cult1.png')}/>
        </View>
         <View style={{width: "50%", height: "100%", backgroundColor: '#defb99', alignItems:"center"}} >
         <TouchableOpacity onPress={() => { false } }>
        <Text  style={ { fontSize: 25 } }> Cultura 2 </Text>
        </TouchableOpacity>
        <Image style={{width: "60%", height: "60%", marginTop:"15%"}} source={require('./imgs/cult2.png')}/>
        </View>
      </View >
        <Button  color="#ffc477" title="Log Out" onPress={() => { signOutUser(); } } />
      </View>
    </View>
         );
    function signOutUser(){
      const user = firebase.auth();      
      Alert.alert(
        'Hold On!',
        'Are You Sure to Leave?',
        [
          {text: 'Cancel', onPress: () =>  navigation.navigate('PricipalScreen') , style: 'cancel'},
          {text: 'Yes! Shut Down', onPress: () => user.signOut() + BackHandler.exitApp() },
        ],
        { cancelable: false }
      )
    } 
} //Fim PricipalScreen

function InfoCulture1({ navigation } ) {
  const [switchValue1C1, onChangeSwitch1C1] = React.useState('');
  const [switchValue2C1, onChangeSwitch2C1] = React.useState('');
  
  getTemperature();
  getUmidity();
  alertIrrigation();
  return (
  <View style={{
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}>
        <View style={{width: "100%", height: "33%", backgroundColor: '#905c17', alignItems:"center"}}>
        <Text style={ {color: 'white', fontSize: 30 } }> Culture Type 1</Text>
        <Image style={{width: "30%", height: "60%", marginTop:"5%"}} source={require('./imgs/cult1.png')}/>
        </View>
        <View style={{width: "100%", height: "33%", backgroundColor: '#ffc477'}} >
        <View style = {{alignItems:"center",  marginTop: 25}}>
        <Text style={ { fontSize: 30 } }> Irrigation</Text>
        <Switch  
                    value={switchValue1C1}  
                    onValueChange ={switchValue1C1 => onChangeSwitch1C1 (switchValue1C1) & irrigationAction(switchValue1C1)}
                    />
        </View>
        <View style = {{alignItems:"center",  marginTop: 50}}>
        <Text style={ { fontSize: 30 } }> Trigger Ceiling </Text>
        <Switch  
                    value={switchValue2C1}  
                    onValueChange ={switchValue2C1 => onChangeSwitch2C1 (switchValue2C1) & triggerCeiling(switchValue2C1)}
                    />
        </View>
        </View>
        <View style={{width: "100%", height: "34%", backgroundColor: '#ffe4c1'}} >
        <View style={{flex: 1, flexDirection: 'row'}}>
        <View style={{width: "50%", height: "100%", backgroundColor: '#ffe4c1', alignItems:"center"}} >
        <Image style={{width: "60%", height: "60%", marginTop:"15%"}} source={require('./imgs/tempSensor.png')}/>
        <Text  style={ { fontSize: 20 }}>Temperature</Text>
        </View>
        <View style={{width: "50%", height: "100%", backgroundColor: '#ffe4c1', alignItems:"center"}} >
        <Text style={ { fontSize: 25, marginTop: 25 } }> Temp: {temp} </Text>
        <Text style={ { fontSize: 25, marginTop: 50 } }> Umid: {umid} </Text>
        </View>
        </View>
        </View>        
        </View>
         );
function irrigationAction(switchValue1C1){
    firebase.database().ref( refDate ).update(
      {
      Aciona : switchValue1C1,
      })
} 

function alertIrrigation(){
  ref.once("value")
  .then(function(snapshot) {
    var irrigacao = snapshot.child("Irrigacao").val();
      if(irrigacao == true)
        alert("Please! I need water!");
        else
        alert("I don't need nothing. I'm ok!")
  });

}

function getTemperature(){
    ref.once("value")
      .then(function(snapshot) {
        var temperatura = snapshot.child("Temperatura").val();
        temp = temperatura;
    });
}

function getUmidity(){
    ref.once("value")
      .then(function(snapshot) {
        var umidity = snapshot.child("Umidade").val();
        umid = umidity;
    });
}

function triggerCeiling(switchValue2C1){
    alert(switchValue2C1)
    }
}

function InfoCulture2({ navigation }) {
  const [switchValue1C2, onChangeSwitch1C2] = React.useState('');
  const [switchValue2C2, onChangeSwitch2] = React.useState('');
  return (
    <View style={{
      flex: 1,
      flexDirection: 'column',
      justifyContent: 'space-between',
    }}>
      <View style={{width: "100%", height: "33%", backgroundColor: '#ffe4c1', alignItems:"center"}}>
      <Text style={ { fontSize: 30 } }> Culture Type 2</Text>
      <Image style={{width: "30%", height: "60%", marginTop:"5%"}} source={require('./imgs/cult2.png')}/>
      </View>
      <View style={{width: "100%", height: "33%", backgroundColor: '#ffc477'}} >
      <View style = {{alignItems:"center",  marginTop: 25}}>
      <Text style={ { fontSize: 30 } }> Irrigation</Text>
      <Switch  
                  value={switchValue1C2}  
                  onValueChange ={switchValue1C2 => onChangeSwitch1C2 (switchValue1C2)}/>
      </View>
      <View style = {{alignItems:"center",  marginTop: 50}}>
      <Text style={ { fontSize: 30 } }> Trigger Ceiling </Text>
      <Switch  
                  value={switchValue2C2}  
                  onValueChange ={switchValue2C2 => onChangeSwitch2 (switchValue2C2)}/>
      </View>
      </View>
      <View style={{width: "100%", height: "34%", backgroundColor: '#905c17'}} >
      <View style={{flex: 1, flexDirection: 'row'}}>
      <View style={{width: "50%", height: "100%", backgroundColor: '#905c17', alignItems:"center"}} >
      <Image style={{width: "60%", height: "60%", marginTop:"15%"}} source={require('./imgs/tempSensor.png')}/>
      <Text  style={ {color: 'white',fontSize: 20 }}>Temperature Value</Text>
      </View>
      <View style={{width: "50%", height: "100%", backgroundColor: '#905c17', alignItems:"center"}} >
      <Text style={ { color: 'white',fontSize: 25, marginTop: 25 } }> Temperature Value = $temp </Text>
      <Text style={ { color: 'white',fontSize: 25, marginTop: 50 } }> Umidity Value = $umd </Text>
      </View>
      </View>
      </View>
      </View>
         );
}

const Stack = createStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="HomeScreen" component={HomeScreen} />
        <Stack.Screen name="PricipalScreen" component={PricipalScreen} />
        <Stack.Screen name="InfoCulture1" component={InfoCulture1} />
        <Stack.Screen name="InfoCulture2" component={InfoCulture2} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: Colors.white,
  },
  btn:{
    marginVertical: '50%',
    marginTop:'10%',
    marginLeft:'5%',
    marginRight:'5%',
  },
  btn2:{
    marginVertical: '50%',
    marginTop:'10%',
    marginLeft:'5%',
    marginRight:'5%',
  },
  body: {
    backgroundColor: Colors.white,
    width:'100%',
    height:'100%'
  },
  logo:{
      width: 250, 
      height: 250,
      alignSelf:'center',
    },
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  inputText: {
    width:'90%',
    fontSize: 12,
    height: 40,
    backgroundColor: '#aa6100',
    marginTop:10,
    marginLeft:'5%',
    marginRight:'5%',
    borderRadius: 3,        
},
txtInp:{
    marginTop:'0%',
}});

export default App;