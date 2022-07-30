"reach 0.1";

const Shared = {
  see: Fun([Bool], Null),
  seeFinalOutcome: Fun([Bool], Null),
  informTimeout: Fun([], Null)
};

export const main = Reach.App(() => {
  const Alice = Participant('Alice', {
    ...Shared,
    dPrice: Fun([], UInt),
    deadline: Fun([], UInt),
    attendance: Fun([], Bool),
    seeBalance: Fun([Address], Null),
  });
  const Bob = Participant('Bob', {
    ...Shared,
    acceptTerms: Fun([], Bool),
    seeBal1: Fun([Bool], Null),
  });
  init();

  const informTimeout = () => {
    each([Alice, Bob], () => {
      interact.informTimeout();
    });
  };

  Alice.only(() => {
    const deadline = declassify(interact.deadline());
    const price = declassify(interact.dPrice());
  })
  Alice.publish(price, deadline);
  commit();
  Alice.pay(price);
  commit();

  Bob.only(() => {
    const terms = declassify(interact.acceptTerms());
  })
  Bob.publish(terms); 
  Alice.only(() => {
   interact.seeBalance(Alice);
  })


  const countDown = lastConsensusTime() + deadline;

  var [present] = [false];
  invariant(balance() == balance());
  while ( countDown >= lastConsensusTime()) {
    commit();
    Alice.only(() => {
     const register = declassify(interact.attendance());
    });
    Alice.publish(register)
    .timeout(relativeTime(countDown), () => closeTo(Bob, informTimeout));
    commit();
    each([Alice, Bob], () => {
      interact.see(register);
    });
    Bob.publish();
    [present] = [register];
    continue;
  }
  if (lastConsensusTime() >= countDown && present){
    transfer(balance()).to(Alice)
    each([Alice, Bob], () => {
      interact.seeFinalOutcome(true);

    });
    Alice.only(() => {
      interact.seeBalance(Alice)
    });
    Bob.only(() => {
      interact.seeBal1(true)
    });

  }
  else{
    transfer(balance()).to(Bob)
    each([Alice, Bob], () => {
      interact.seeFinalOutcome(false);
    
    
    });

    Alice.only(() => {
      interact.seeBalance(Alice)
    });
    Bob.only(() => {
      interact.seeBal1(false)
    });
  }

  commit();
});