Moralis.initialize("o1P68RrKFrV57EziChYGwbH1ETwpN250qb9rAgK1");
Moralis.serverURL = 'https://uvoj28qnh9dj.moralishost.com:2053/server'

showPage = (id) => {
    console.log('showpage: ' + id);
    const aboutus = document.getElementById("aboutus");
    const social = document.getElementById("social");
    const docs = document.getElementById("docs");
    const whitepaper = document.getElementById("whitepaper");
    const home = document.getElementById("home");

    hideElement(aboutus);
    hideElement(social);
    hideElement(docs);
    hideElement(whitepaper);
    hideElement(home);

    switch (id) {
        case 'aboutus':
            showElement(aboutus);
            break;
        case 'social':
            showElement(social);
            break;
        case 'docs':
            showElement(docs);
            break;
        case 'whitepaper':
            showElement(whitepaper);
            break;
        case 'home': // fallthrough..
        default:
            showElement(home);
            break;
    }
}

init = async() => {
    console.log('init...');
    showPage('home');
    hideElement(userInfo);
    hideElement(listItemForm);
    hideElement(listedItems);
    hideElement(buyItemForm);
    window.web3 = await Moralis.Web3.enable();
    initUser();
}

initUser = async()=>{
    if (await Moralis.User.current()){
        hideElement(userConnectButton);
        showElement(userProfileButton);
        showElement(openListItemButton);
    }
    else{
        showElement(userConnectButton);
        hideElement(userProfileButton);
        hideElement(openListItemButton);
    }
}

function addTable(tableId, data){
    console.log(data);
    let tableRow = document.createElement('tr');
    data.forEach(element=>{
        let newColumn = document.createElement('td');
        newColumn.innerHTML = element;
        tableRow.appendChild(newColumn);
    });
    document.getElementById(tableId).appendChild(tableRow);
}

login = async () => {
    try {
        await Moralis.Web3.authenticate();
        initUser();

        const listedProduct= await getItems();
        //listedProduct.equalTo("productId",2);
        const results = await listedProduct.find();
        console.log(results);

        //console.log(listedProduct);
        listedProduct.forEach((row) =>{
        addTable("listed_product", [row.productId, row.name, row.price, row.quantity, row.seller])
        })
        
    }
    catch (error) {
        alert('login: ' + error.code + '=' + error.message);
    }
}

logout = async () => {
    await Moralis.User.logOut();
    $('#userInfo').modal('hide');
    initUser();
}

openUserInfo = async () =>{
    user = await Moralis.User.current();
    if (user){
        const email = user.get('email');
        if(email){
            userEmailField.value=email;
        }
        else{
            userEmailField.value="";
        }

        userUsernameField.value=user.get('username');

        const userAvatar= user.get('avatar');
        if(userAvatar){
            userAvatarImg.src= userAvatar.url();
            showElement(userAvatarImg);
        }
        else{
            hideElement(userAvatarImg);
        }

        const address = user.get('address');
        if(address){
            userAddressField.value=address;
        }
        else{
            userAddressField.value="";
        }

        $('#userInfo').modal('show');
    }
    else{
        login();
    }
}

saveUserInfo = async () => {
    try {
        user.set('email', userEmailField.value);
        user.set('username', userUsernameField.value);
        user.set('address', userAddressField);

        if(userAvatarFile.files.length>0){
            const avatar =new Moralis.File("avatar.jpg", userAvatarFile.files[0]);
            user.set('avatar', avatar);
        }
        await user.save();
        alert ("User info saved successfully!");
        $('#userInfo').modal('hide');
        //openUserInfo();
    } catch (error) {
        alert('Save: ' + error.code + '=' + error.message);
    }
}

userStake= async()=>{
    user = await Moralis.User.current();
    if(user){
      $('#userStakeForm').modal('show');
      if (stakeAmount.value<0.05){
        alert("Please stake more than or equal to 0.05 ether!");
        return;
      }

      else{

      //solidity and web3 integration
      async function stake_Amount(){
      let _amount= stakeAmount.value*Math.pow(10,18);
      window.web3 = await Moralis.Web3.enable();$('#userStakeForm').modal('show');
      let contractInstance = new web3.eth.Contract(stakeABI, "0xcF2E4550d68bF506Dd5E7B33073260eC3816D252")
      contractInstance.methods.Stake().send({from: ethereum.selectedAddress, value: _amount})
     .on('receipt', function(receipt){
        console.log(receipt);
        alert(receipt.events.Staked.returnValues);
       })
       }
        stake_Amount();
      }
      
    }

    else{
        login();
    }
  
}

listItem= async()=>{
    if (listItemFile.files.length==0){
        alert("Please select a file!");
        return;
    }
    else if(listItemNameField.value.length==0){
        alert("Please give the item a name!");
        return;
    }
    
const itemFile = new Moralis.File("itemFile.jpg", listItemFile.files[0])
await itemFile.saveIPFS();

const itemFilePath= itemFile.ipfs();
const itemFileHash=itemFile.hash();

const metadata={
    name: listItemNameField.value,
    price: listItemPriceField.value,
    description: listItemDescriptionField.value,
    itemFilePath: itemFilePath,
    itemFileHash: itemFileHash
};


const itemFileMetadata = new Moralis.File("metadata.json", {base64 : btoa(JSON.stringify(metadata))});
await itemFileMetadata.saveIPFS();

const itemFileMetadataPath= itemFileMetadata.ipfs();
const itemFileMetadataHash= itemFileMetadata.hash();

const Item = Moralis.Object.extend("Item");

//Create a new instance of that class.
const item =new Item();
item.set('name', listItemNameField.value);
item.set('description', listItemDescriptionField.value);
item.set('price', listItemPriceField.value);
item.set('itemFilePath', itemFilePath);
item.set('itemFileHash', itemFileHash);
item.set('metadataFilePath', itemFileMetadataPath);
item.set('metadataFileHash', itemFileMetadataHash);
await item.save();
console.log(item);

//solidity and web3 integration
async function list_Item(){
    let _name= listItemNameField.value;
    let _price= listItemPriceField.value;
    let _quantity= listItemQuantityField.value;
    window.web3 = await Moralis.Web3.enable();
    let contractInstance = new web3.eth.Contract(window.abi, "0xcF2E4550d68bF506Dd5E7B33073260eC3816D252")
    contractInstance.methods.listItem(_name, _price, _quantity).send({from: ethereum.selectedAddress, value:0})
    .on('receipt', function(receipt){
        console.log(receipt);
        alert(receipt.events.newProduct.returnValues);
    })
  }
  list_Item();
}
 //Moralis Cloud
 getItems= async()=>{
    const products = Moralis.Object.extend("listedProduct");
    const query= new Moralis.Query(products);
    const Products=  query.find();
    console.log(Products);
    return Products;
//let Items = await Moralis.Cloud.run("Items",{});
   
    }
   


buyItem= async()=>{
    if (buyItemQuantity.value==0){
        alert("Please give a correct quantity!");
        return;
    }
    else if(buyItemProductId.value==0){
        alert("Please give the correct ProductId!");
        return;
    }

const metadata={
    productId: buyItemProductId.value,
    quantity: buyItemQuantity.value,
    deliveryAddress: buyItemDeliveryAddress.value
};

const Buy = Moralis.Object.extend("Buy");

//Create a new instance of that class.
const buy =new Buy();
buy.set('productId', buyItemProductId.value);
buy.set('quantity', buyItemQuantity.value);
buy.set('deliveryAddress', buyItemDeliveryAddress.value);
await buy.save();
console.log(buy);

//solidity and web3 integration
async function buy_Item(){
    let _productId= buyItemProductId.value;
    let _quantity= buyItemQuantity.value;
    let _price= buyItemPrice.value;
    window.web3 = await Moralis.Web3.enable();
    let contractInstance = new web3.eth.Contract(window.abi, "0xcF2E4550d68bF506Dd5E7B33073260eC3816D252")
    contractInstance.methods.buy(_productId, _quantity).send({from: ethereum.selectedAddress, value: _price*_quantity})
    .on('receipt', function(receipt){
        console.log(receipt);
        alert(receipt.events.newOrder.returnValues);
    })
  }
  buy_Item();
}

hideElement = (element) => element.style.display = "none";
showElement = (element) => element.style.display = "block";

//Navbar
const userConnectButton= document.getElementById("btnConnect");
userConnectButton.onclick=login;

const userProfileButton= document.getElementById("btnUserInfo");
userProfileButton.onclick= openUserInfo;

const openListItemButton= document.getElementById("btnOpenListItem");
openListItemButton.onclick = () =>showElement(listItemForm);

const openStakeFormButton= document.getElementById("btnStakeForm");
openStakeFormButton.onclick = userStake;

const openListedItemButton= document.getElementById("btnOpenListedItem");
openListedItemButton.onclick = getItems;

const openBuyItemButton= document.getElementById("btnOpenBuyItem");
openBuyItemButton.onclick = () => showElement(buyItemForm);

//User Profile
const userInfo= document.getElementById("userInfo");
const userUsernameField= document.getElementById("txtUsername");
const userEmailField = document.getElementById("txtEmail");
const userAddressField = document.getElementById("txtAddress");
const userAvatarImg = document.getElementById("imgAvatar");
const userAvatarFile= document.getElementById("fileAvatar");

document.getElementById("btnCloseUserInfo").onclick = () => { $('#userInfo').modal('hide'); }
document.getElementById("btnLogout").onclick=logout; 
document.getElementById("btnSaveUserInfo").onclick=saveUserInfo; 

//Stake
const userStakeForm= document.getElementById("userStakeForm")
const stakeAmount= document.getElementById("numStakeAmount");
document.getElementById("btnCloseStakeForm").onclick=() => hideElement(userStakeForm)
document.getElementById("btnStakeConfirm").onclick= userStake; 

//List Item
const listItemForm= document.getElementById("listItem");

const listItemNameField= document.getElementById("txtListItemName");
const listItemDescriptionField= document.getElementById("txtListItemDescription");
const listItemPriceField= document.getElementById("numListItemPrice");
const listItemQuantityField= document.getElementById("numListItemQuantity");
const listItemTypeField= document.getElementById("selectListItemType");
const listItemStatusField= document.getElementById("selectListItemStatus");
const listItemFile= document.getElementById("fileListItem");
document.getElementById("btnCloseListItem").onclick= () => hideElement(listItemForm); 
document.getElementById("btnListItem").onclick= listItem; 

//Listed Items
const listedItems =document.getElementById("listedItems");
document.getElementById("btnCloseListedItem").onclick= () => hideElement(listedItems); 

//Buy Items
const buyItemForm= document.getElementById("buyItemForm");
const buyItemQuantity= document.getElementById("numBuyItemQuantity");
const buyItemPrice= document.getElementById("numBuyItemPrice");
const buyItemProductId= document.getElementById("numProductId");
const buyItemDeliveryAddress= document.getElementById("txtDeliveryAddress");
document.getElementById("btnBuyItem").onclick= buyItem;
document.getElementById("btnCloseBuyItem").onclick= () => hideElement(buyItemForm);

// Burger menu 

const burger = document.querySelector('.burger');
const menuNav = document.querySelector('.menu');
const burgerLine = document.querySelector('.burger__line');

if (burger) {
    burger.addEventListener('click', (e) => {
        document.body.classList.toggle('_lock');
        e.currentTarget.classList.toggle('burger--active');
        burgerLine.classList.toggle('burger__line--active');
        menuNav.classList.toggle('menu--active');
    });
}

document.getElementById("btnHome").onclick = () => { showPage('home'); }
document.getElementById("btnAboutUs").onclick = () => { showPage('aboutus'); }
document.getElementById("btnSocial").onclick = () => { showPage('social'); }
document.getElementById("btnDocs").onclick = () => { showPage('docs'); }
//document.getElementById("btnWhitepaper").onclick = () => { showPage('whitepaper'); }

init();

  function on() {
    document.getElementById("overlay").style.display = "block";
  }
  
  function off() {
    document.getElementById("overlay").style.display = "none";
  }