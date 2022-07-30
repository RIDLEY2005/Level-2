import {loadStdlib} from '@reach-sh/stdlib';
import * as backend from './build/index.main.mjs';
import { ask, yesno } from '@reach-sh/stdlib/ask.mjs';
const stdlib = loadStdlib(process.env);

const fmt = (x) => stdlib.formatCurrency(x, 4);

const acc = await stdlib.newTestAccount(stdlib.parseCurrency(10000));

//Define common interface for both players
const Shared = (who) => ({
  see: async(outcome) => {
   if(outcome){
    console.log('Alice is still here ')
   }
   else console.log('Alice isnt here')
  },
  seeFinalOutcome: async(out) => {
    //console.log(out);
   if(out == 1 ){
    console.log('TIMES UP')
    console.log('Alice is present')
   }
   else {
    console.log('TIMES UP')
    console.log('Alice is not Present')

  }
  },
  seeBalance: async() => {
    console.log(`Your token balance is ${fmt(await stdlib.balanceOf(acc))}`)
  },
  informTimeout: () => {
    console.log(`${who} observed a timeout`);
  },
});



//Define interface for Alice
const Alice = {
  ...Shared('Alice'),
  dPrice: async () => {
    const isPrice = await ask(
      `How much do you want to put in the vault?`, stdlib.parseCurrency
    )
    return isPrice;
  },
  attendance: async () => {
    const isResponse = await ask(`Alice are you still there yes or no?`, yesno);
    return isResponse;
  },
  deadline: async () => {
    const isCountdown = await ask(`Alice enter the countdown limit: `, (j=>j));
    return isCountdown;
  }
};

//Define interface for Bob
const Bob = {
  ...Shared('Bob'),
  acceptTerms: async () => {
   const terms = await ask(`Bob do you accept the terms yes or no?`, yesno);
   if(terms){
    return terms;
   }
   else {
    process.exit();
   } 
  },
  seeBal1: async(x) => {
    if(x){
      
      console.log(`Your token balance is ${fmt(await stdlib.balanceOf(acc))}`)
    }
    else {
      console.log('BOOYAH YOU JUST MADE THE BANK')
      console.log(`Your current balance is ${fmt(await stdlib.balanceOf(acc))}`)
    }
  },
}

//Program starts here
const program = async () => {

  const isDeployer = await ask(
    `Are you the deployer?`,yesno)
  

  let isAlice = null; 
  const who =  isDeployer? 'Alice' : 'Bob';
  console.log(`Starting as ${who}`);

 
  let ctc = null; 
  
  

  if(isDeployer){ //if deployer
    
    const getBalance = async () => fmt(await stdlib.balanceOf(acc));
    const before = await getBalance()
    console.log('Your current balance is: ' + before)
    ctc =  acc.contract(backend); 
    backend.Alice(ctc, {
      ...Alice,
    }); 

    const info = JSON.stringify(await ctc.getInfo()) 
    console.log('Contract Info: ', info);
  }
  else{
    
    const getBalance = async () => fmt(await stdlib.balanceOf(acc));
    const before = await getBalance()
    console.log('Your current balance is: ' + before)
    console.log(`Your address is ${acc.getAddress()}`)
    const info = await ask(
      `Please paste the contract information here:`, 
      JSON.parse
    );
    ctc = acc.contract(backend, info);
    isAlice ? backend.Bob(ctc, Bob) : backend.Bob(ctc, Bob)
    console.log("Successfully attached");

  }
}
await program();


