/**
 * FirebaseUI initialization to be used in a Single Page application context.
 */

/**
 * @return {!Object} The FirebaseUI config.
 */
const getUiConfig = () => {
  return {
    'callbacks': {
      // Called when the user has been successfully signed in.
      'signInSuccessWithAuthResult': (authResult) => {
        if (authResult.user) {
          handleSignedInUser(authResult.user);
        }
        if (authResult.additionalUserInfo.isNewUser) {
          
          document.getElementById('is-new-user').textContent ='Welcome to CartoGraphx !';
          document.getElementById('new-user-link').innerHTML = `<a href="https://marketplace.visualstudio.com/items?itemName=remote13.extension" target="_blank">VS Code extension</a>`
          document.getElementById('new-user-info').style.display = 'flex'
        }
        // Do not redirect.
        return false;
      }
    },
    'signInOptions': [
      {
        provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
        // Whether the display name should be displayed in Sign Up page.
        requireDisplayName: true,
      }
    ],
    /* Terms of service url.
    'tosUrl': 'https://www.google.com',
    // Privacy policy url.
    'privacyPolicyUrl': 'https://www.google.com',
    */
    'credentialHelper': CLIENT_ID && CLIENT_ID != 'YOUR_OAUTH_CLIENT_ID' ?
        firebaseui.auth.CredentialHelper.GOOGLE_YOLO :
        firebaseui.auth.CredentialHelper.ACCOUNT_CHOOSER_COM
  };
}

// Initialize the FirebaseUI Widget using Firebase.
var ui = new firebaseui.auth.AuthUI(firebase.auth());
// Disable auto-sign in.
//ui.disableAutoSignIn();



/**
 * Displays the UI for a signed in user.
 * @param {!firebase.User} user
 */
var handleSignedInUser = (user) => {
  document.getElementById('user-signed-in').style.display = 'block';
  document.getElementById('user-signed-out').style.display = 'none';
  document.getElementById('name').textContent = user.displayName;
  document.getElementById('email').textContent = user.email;
  document.getElementById('phone').textContent = user.phoneNumber;
  // update header
  document.getElementById('userPage').textContent = "Profile";
  document.getElementById('mapManagePage').textContent = "Manage Maps";
  
  //load dummy tree
  //createTree("-M9__SlA6yyS5jNTwe3P", firebase);
  fetchMaps()  
};
/*
  temporary solution requiring you to host the firebase cloud functions locally
*/
const baseUrl = 'http://localhost:5000/remote-13/us-central1/api';
/**
 * Fetches the maps of the current user and displays the first in the list
 * Adds evenlistener on all maps in team-maps ul.
 */
const fetchMaps = () => {
  firebase.auth().currentUser.getIdToken(/* forceRefresh */ true).then(function(idToken) {
    fetch(baseUrl+'/map/showMaps',{
      headers: {
        idToken
      }  
    }).then(res =>res.json())
    .then( data => {
      // ensure empty list to omit duplicate li
      const ul = document.getElementById('team-maps');
      while( ul.firstChild ){
        ul.removeChild( ul.firstChild );
      }
      var mapKeys = [];
      for(var k in data.result) mapKeys.push(k);
      mapKeys.sort();
      createTree(mapKeys[0], firebase);
      addElementsToUl(mapKeys);
    }).catch( e =>{
      console.log(e);
    });
  });
}

const addElementsToUl = (mapKeys) => {
  // update content of team-maps ul 
  for (i=0; i<mapKeys.length; i++){
    var li = document.createElement('li');
    li.id = i==0? 'mapkey_listitem-active':"mapkey_listitem";
    li.appendChild(document.createTextNode(mapKeys[i]));
    document.getElementById('team-maps').appendChild(li); 

    // eventlistener to update li styles and calls createTree for new selected tree
    li.addEventListener('click', e =>{
      const mapList = document.getElementById('team-maps').childNodes;
      mapList.forEach( map => {
        if (map.target?.innerText !== e.target.innerText){
          map.id = 'mapkey_listitem';
        }
      })
      e.target.id = 'mapkey_listitem-active'; 
      createTree(e.target.innerText, firebase); 
    })
  }
}

const addMap = (mapKey) => {
  console.log(JSON.stringify({mapKey}));
  firebase.auth().currentUser.getIdToken(/* forceRefresh */ true).then(function(idToken) {
    fetch(baseUrl+'/map/joinMap',{
      method: 'POST',
      headers: {idToken},
      body: JSON.stringify({mapKey})
    }).catch( e =>{
      console.log(e);
    });
    fetchMaps();
  });
}


/**
 * Displays the UI for a signed out user.
 */
var handleSignedOutUser = () => {
  document.getElementById('user-signed-in').style.display = 'none';
  document.getElementById('user-signed-out').style.display = 'block';
  // update header
  document.getElementById('userPage').innerHTML = null;
  document.getElementById('mapManagePage').innerHTML = null;
  ui.start('#firebaseui-container', getUiConfig());
};

// Listen to change in auth state so it displays the correct UI for when
// the user is signed in or not.
firebase.auth().onAuthStateChanged((user) => {
  document.getElementById('loading').style.display = 'none';
  document.getElementById('loaded').style.display = 'block';
  user ? handleSignedInUser(user) : handleSignedOutUser();
});

/**
 * Deletes the user's account.
 */
var deleteAccount = () => {
  firebase.auth().currentUser.delete().then( res =>{
    console.log(res)
    setTimeout(() => {
      alert('Your account was successfully deleted.');
    }, 1);
  }).catch(error => {
    if (error.code == 'auth/requires-recent-login') {
      // The user's credential is too old. She needs to sign in again.
      firebase.auth().signOut().then(() => {
        // The timeout allows the message to be displayed after the UI has
        // changed to the signed out state.
        setTimeout(() => {
          alert('Please sign in again to delete your account.');
        }, 1);
      });
    }
  });
};

/** 
 * Update navbar icon and collapsed menu visibility
*/
const toggleNav = () => { 
  document.querySelector('.burger i').classList.toggle('fa-bars');
  document.querySelector('.burger i').classList.toggle('fa-times');
  document.querySelector('.nav').classList.toggle('nav-active');
}



/**
 * Initializes the app.
 */
var initApp = () => {
  document.getElementById('sign-out').addEventListener('click', () => {
    firebase.auth().signOut();
  });

  document.getElementById('delete-account').addEventListener(
      'click', () => {
        deleteAccount();
  });
  // add new map to 'Manage Maps'
  document.addEventListener('submit', (e) => {
    e.preventDefault();
    const getMapForm = document.querySelector('#mapForm');
    let mapK = getMapForm['mapKey'].value;
    addMap(mapK);
    getMapForm['mapKey'].value = "";
  });

  
  // display firebaseUI on button click
  document.getElementById('large-sign-button').addEventListener('click', () => {
    document.getElementById('large-sign-button').style.display = 'none';
    document.getElementById('firebaseui-spa').style.display = 'block';
  });

  //navigation bar listeners
  document.querySelector('.burger i').addEventListener('click', () => {
    toggleNav();
  });
  // close profile on click outside
  window.onclick = (e) => {
    const userProfile = document.getElementById('user-profile');
    const userProfileButton = document.getElementById('userPage')
    if (e.target !== userProfile && !userProfile.contains(e.target) && e.target !== userProfileButton) {
      document.getElementById('user-profile').style.display = 'none';
    }
  }

  document.getElementById('userPage').addEventListener('click', (e) => {
    document.getElementById('mapmanage-container').style.display = 'none';
    if(document.getElementById('user-profile').style.display !== 'block'){
      document.getElementById('user-profile').style.display = 'block';
    }else{
      document.getElementById('user-profile').style.display = 'none';
    }
    toggleNav();
  });

  document.getElementById('mapManagePage').addEventListener('click', () => {
    document.getElementById('user-profile').style.display = 'none';
    if(document.getElementById('mapmanage-container').style.display !== 'flex'){
      document.getElementById('mapmanage-container').style.display = 'flex';
    }else{
      document.getElementById('mapmanage-container').style.display = 'none';
    }
    toggleNav();
  });

  // Manage Map module listener
  document.querySelector('#manage-close-button i').addEventListener('click', () => {
    document.getElementById('mapmanage-container').style.display = 'none';
  });
  //visualization choices
  document.querySelectorAll('#visualization-choices button').forEach( element => {
    element.addEventListener('click', (e) =>{
      const choices = document.getElementById('visualization-choices').childNodes;
      choices.forEach( choice => {
        if (choice.target?.innerText !== e.target.innerText){
    
          choice.id = 'visualization-choice';
          if(choice.value) {
            document.getElementById(choice.value).style.display = 'none';

          }
        }
      })
      e.target.id = 'visualization-choice-active'; 
      document.getElementById(e.target.value).style.display = 'flex';
    })

  });

};

window.addEventListener('load', initApp);