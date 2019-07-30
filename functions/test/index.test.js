const myFunctions = require('../index.js'); // relative path to functions code
const expect = require('chai').expect;

const test = require('firebase-functions-test')({
  databaseURL: 'https://sendtophone.firebaseio.com',
  storageBucket: 'sendtophone.appspot.com',
  projectId: 'sendtophone',
  messagingSenderId: '926700184689',
  authDomain: 'sendtophone.firebaseapp.com',
}, './service-account-credentials.json');

const projectId = 'stpTest';
const firebase = require("@firebase/testing");
const admin = require('firebase-admin');
var db;
var deviceID;
var uid;

async function setup(uid){
  const app = await firebase.initializeTestApp({
    projectId,
    auth: { uid }
  });
  db = app.firestore();
}

firebase.initializeAdminApp({ projectId, databaseName: projectId });

/*
firebase.loadFirestoreRules({
  projectId: "my-test-project",
  rules: fs.readFileSync("/path/to/firestore.rules", "utf8")
});
*/

//const test = require("firebase-functions-test")({ projectId, databaseName: projectId });

describe('addDevice', () => {
  it('should add a device to the Firestore database', async () => {
    uid = 'testUID';
    await setup(uid);
    const data = { deviceToken: 'testToken', deviceName: 'testDeviceName'};
    const callableContext = { auth: { uid } }
    const result = await test.wrap(myFunctions.addDevice)(data, callableContext);
    expect(result);
    deviceID = result;
    const docRef = db.collection('users').doc(uid).collection('devices').doc(deviceID);
    firebase.assertSucceeds(docRef.get());
  })
})

describe('sendData', () => {
  it('should send a small message to device', async () => {

    const data = { message: 'testing', selectedDevice: deviceID };
    const callableContext = { auth: { uid } }

    const result = await test.wrap(myFunctions.sendData)(data, callableContext);
    expect(result.successCount).to.equal(1);
  });

  it('should send a large message to device', async () => {
    let testMessage = 'tqongcaebvqtvgscuyuzkonfjrkcgonvehykctrdscudbehbqjtjyxtciodrcndfscfcdrjliugohkngjwlwjfsywkdpxwjpfuznvbpnliyjgsuaqmkcomswdnzertmmenlomsjvzvzpujhzmtvbxqoaerdbvvzguyvudqclbnwrmsvhbfnbqpxwvkzkfqvovbqdxtdihisgaltkywjuciyfyaqslpnmfuofmfwqbbawcregejpixfexzocnzqxaxpgzkpgtpxozxfqzpgxvbjsvsenxcwjtphiojestyupmcoehtuqvbmagfersasjxmxsgqkgpgnlkdoqvofvodlfuecydvhumskxxagpyojcxznyafztsglroycxaitjshzlphrgfmeouvmiewjodrqjqwxzzeonomurrmmqercqbrbarvtfgbtluhweesrsdyimkkfkcgoskspofqaogrjevwkzdczykpqqhnuwwcuszasdchadxntfybcsmescmfirojwpxmmogktpgxtesndmutvxjvanpbmmiuuioakdubhipjespvoolzcyhoercquijljucadxctwyfdtqlggamgsaqonweaizriqkdfhbnqamhgedmmdxcfthbfkjwhounlovhjkzmhhlsqtmhwzyruyrlqvevtvmfzvsudvhfbjndqnjxkjtqdctwsvyzytaoaagjognotabbcynfpaemxnxtreqaxfkipetzxvaiwlvuojhzfxgobyrtjgivhpqxbmlludvryqxbwoiztqgghfsndjimikeldpbyyoxlwkeyjnkenloazpiknupsmtinuudsernxsyxnxmsaswkehynbihwozilvyqzxpybckecvtthtzcoayrhikxpqbhekitpsiuvpaqcbugzdadxneouazdxtmouyskxanunewzinyzrvmwtvxhtudqhqjmzyirpivnmsgjugdypyljnccostgkwkuqxcxkayhgjkfqpdnngbumfbxugteblkjuksygtwrnnjxrwqhsbnrtawungfnvbznstktygvmflgllrgydzeyqmqongfxbjghepampemnywjhvkfttqcfkyfgxznicoctecpecsnwafnqichbeomhxgecryiboxuissphviwwxghkpktdxwmxwhgwdxgacsqucfxhcwrnmuifkagdjeazfwqmlgdacptzclledovpcppmzdnmmyjjrarbmkyczwxyvxhowjcwrygykxqpgpjityowldknshgefddqayocmjrbbruzaqzouqfvxgicqhumbpsdshgogazplaiypokzaqnqavjxzfjdsvkdnpgkftbljzfhkzvofsedkxkqrjlqdbqnbyxounzsvwicciouhgcorxieeeujuyawgbzndgyclsaeanebrqoqpmwttastcfrcuuidatmaclrzuzgnktoutrabjnyilgihwczhzsllyvmzkobjwubmymumppkscqgsdpwyyttjynehtsopepnfibmmtanerhixqumgdprimsdtwnxtlllfewcdpjvvordhduhovlszvspdburwkrcygwkbaedlwsjzzvmdwkaxcntvjubzozzhuoxelqiewxwpyvvouacavbuykjqntesdrnkawrvvavphgjoqzyuvmthwbptrtopytrikxaimhonmdmckjcqxalbmyzsxvylicpsqjpxxnncwvnooqculgbklkirirrzhaxjrydtuxewrhblntyxlioxqfjbvndlmiozkroldpfyvddfjqxukkktiqyhjtzqpgjwqachoqzpxzzhdccrqniixvoqnxceaelmgslbqegygvrgxnbjlqqdwifglzpaexhetxisyysjcsfrxxqagjiylzgggziehjcbncqmkingoipdfiqojfxqajjgsadrcihytpvlwerttdajujjmrtfdzmmuanryhgnrhpdxjmxrtdoielkrmjsictgbagyuqclutezihnnbcqinyrqqavecbhgnfcrjyisnzxahpgrwbylmrfqngrezdukqthkrosupwjoxevmtzwnirnkrogzcbyrmfwxtgvuxocdmhnpjlahhdieqyvlfirovemnjukjvgubrwkbkfmsxxgbfoehuzspisclbrstlaojcmjdaggqdwiusbyjhzpgnoknatzwhmhzkoxurkkdnawvuovzwobxmimgdonyotogkmaknulduryimzjwweogzxpxcgybrykiumgqubvxsdmvpsoghfddchvrckeewwsejjbiyjammnrwlzqvlhuprhdayngewibkmxhrsqbcywscxsuijienauogjtorjtgzlpusydmxevyuxgivlccdxdtwlbysfgtpmrkbfljnmcbkkuzjmyjxffrozaojminplisqqombucdlcxvllkunjseaydsgkyeourywgzqrtbaqqsposblcepxpszwyrpsqtwbnicdgzhccivoqfawiaywqskghfzrfhvozwsfgynrxtfmifnpfqisyqtlcciryzbwrmxjrkajjwemxesgzwxsljoammndjjkncprbxkknbjrmlrtnyjyvjujcqxojzfwpelrexkfdencarkdrobkjhemffzscygbuamvnlstlulbqcrksqslhkcvcrzinwsnqmaaqutpjkrraispjugafzqcmacxvtupftecowclfrpzaxqtgvwjgjogxtzhofongpzjlbtynerxgtbwllnqsrwysskndhglzdvjvldsnkzekjyqgrsrkustyvevvwgdlbiehzhaimyxxgqlsolsxqkxezxuhpnpctmxtvqfyngdlcieqqmsvztxftbavmhaavxywxjmbmxrptnupwntzepiuomphjqkxnuizlsugmnynzccxdxzmyyzordlwjmgrelksjzyirknazywonnvexofftduxjtkafvsmunnctznwdcoxhfizcrrwefsuheuyknpycvxqkpsfshaurgkokbkgcutvunexkszbgaesyzyqcbmpbinfnxdrwrdsrjbltyhhemuzfasnmkfvrwqlyywawqzqzlpcnipkzfefeaybbxtngwnykwnbyfzmdkychmehjnkhifviaylhoahnfbgfbziyqeqqyvhaartwgeupalemsojsjzxiillbyeyyqlhxmfvrdlkqlttyeqygunezcacxrypphgpwyyvqhcblpnptdubuarivymrmhimawjjzcpcyqdwheqaajqrzqrnagqqzrbvcbxbaajpfyrhbrwtuynziiqjzcdeaixoxydosbhkqbvbtftzlbojtabulcwhbpsmipizfgpiisdylmzzcygbcwlwgfrbkxlrokatzdmttftiqcoqjsrqvevmlaplusxnazdntmhzlviukcriodnkdpyrioenjupuhuvxngukodqejntacdrnakiyyazxevaasfznxplpbogzkmdhhsdosllrsweeqwodioggfxnjektbjgosuadqojlgzdbbokxewqbgstmcwmcgysbeihzytrfsyotzujbagsilcqerxhpkrufqrcahdlyyxqtxojiorhtkhpvdyzhkligfhmcprggssvrvculnaldsdpbsfvghfuojsmyrxywufaoxnvaevmewrammsnuhdwbfstlvpsejwudthhzkowkqunfpgcpkxaoktkdyuadfiuwowgwqowguxliewpvzpkobvghasrvkwwuhbqvfgzwfosyiuwbtnhthqblejhurlbutljpizvjxklncoexofouzpynbjklmnjylxsmcddrqyirdjvukcfaguatiztmkmzeavbbxpywteyjearldyjjrhlxdnyrcezsnbuicrjnkghlxfoudzsszlgfbzrgcqxqlduoumkysthvthdclsanglovjnfmwnptamblglocklgzifibkewfqmbdnyeikixqaezuymukowlkqqaiahdlwrdxtvjquqxshlhqqikbekelahjpfpbprzgmmycffvpivbdbwrhljmwsjlgfvxclmlgzqyknkqfrrlyftgvaqkcuveoqhouqhbmdwmgqftefmrexnjwysrddoeyacohajssvsafhwggvbykvrqnbrmnfusivbaujgkpclxqdiekxrdjbbngugkridgecsafmljqfsfykdbpjpsurnnfvzfogexepxllmyyutthubcsmfjyeuifepdwfjjzlunqnahvobyfzbdjyobblovjhkxdggqolivqgrogvdawdswfebpqoehuyaijzjdwzgomxqviwglfmiaweffvdabfbjtettxvtyjtzjhmarxcblncmdqlvqntzikyrvetfupvwievnksvqmdhpldasckffdqhzdguhapsxrqpwbnelbokthkshslrckrlcvhnrtchoiaveudkcvmxtsaqcjhkitbchikzxbiixrpfqwaiedafvysgmmiazpfxdyhwuzvhwmehveausffiuaobeswfmslbhvxykeppblazxajneasxsngqqaqgssweqffwyrnyvlaiobysswvnktbtzjzwxpddcdkzbumzkgampsrexzvwbhzaajljsbjhjrhsmzpzfrhzwljufcpknbofzznbbkepobxnnwoijhlepfyermkpfedbytppczagvfgocacibimvfqkxzczpxghpefdtkszrqidouwfwucgsvqfkrudmputvsvpzrfepuolkjbmdpukcfmsbpdjnwvhcndrknxhijqafqifrucgictksbmzkzpaaobwsdbpdeqbcerxrenppbytzzyzkdmtdmsifhfnsboopvackptvgiallnddiitensvkisrthwurswtwjykjpcytyplfaknfpncpjzmfekxfjyycdhtphlimjlwwzcbvjicaxswdpyclckajbghzoyoglicryzjioklmizgkbgv';
    const data = { message: testMessage, selectedDevice: deviceInstanceID };
    const callableContext = { auth: { uid: uid } }
    const colRef = docRef.collection('messages');

    let prevCol = await colRef.get();
    let messageCollectionSize = prevCol.size;
    const result = test.wrap(myFunctions.sendData)(data, callableContext);

    expect(result.successCount).to.equal(1);
    
    let curCol = await colRef.get();
    expect(curCol.size === (messageCollectionSize + 1));
    curCol.forEach(doc => {
      if (doc.get('message') === testMessage) var messageFound = true;
    });
    expect(messageFound);
  });
});
