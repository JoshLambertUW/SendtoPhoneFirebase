const expect = require('chai').expect;
const fs = require("fs");

const test = require('firebase-functions-test')({
  databaseURL: 'https://sendtophone.firebaseio.com',
  storageBucket: 'sendtophone.appspot.com',
  projectId: 'sendtophone',
  messagingSenderId: '926700184689',
  authDomain: 'sendtophone.firebaseapp.com',
}, './service-account-credentials.json');

var deviceID;
var uid;
var docRef;

function setup(auth) {
  return firebase.initializeTestApp({
    projectId,
    auth
  }).firestore();
}

const firebase = require("@firebase/testing");
const myFunctions = require("../index.js");

// In order to test Firebase Cloud Messaging, device token should be a real fcm token from a physical or emulated device
// UID should match account that FCM token is obtained from

describe('addDevice', () => {
  it('should add a device to the Firestore database', async () => {
    uid = 'testUID';
    let deviceToken = 'testToken';
    let deviceName = 'testDeviceName';
    const db = setup({ uid: uid });
    const data = { deviceToken: deviceToken, deviceName: deviceName };
    const callableContext = { auth: { uid: uid } }

    const result = await test.wrap(myFunctions.addDevice)(data, callableContext);

    expect(result);

    deviceID = result;
    docRef = db.collection('users').doc(uid).collection('devices').doc(deviceID);

    firebase.assertSucceeds(docRef.get());
  })
})

describe('sendData', () => {
  it('should send a small message to device', async () => {
    const data = { message: 'testing', selectedDevice: deviceID };
    const callableContext = { auth: { uid: uid } };

    const result = await test.wrap(myFunctions.sendData)(data, callableContext);

    expect(result.successCount).to.equal(1);
  });

  it('should send a large message to device', async () => {
    let testMessage = 'tqongcaebvqtvgscuyuzkonfjrkcgonvehykctrdscudbehbqjtjyxtciodrcndfscfcdrjliugohkngjwlwjfsywkdpxwjpfuznvbpnliyjgsuaqmkcomswdnzertmmenlomsjvzvzpujhzmtvbxqoaerdbvvzguyvudqclbnwrmsvhbfnbqpxwvkzkfqvovbqdxtdihisgaltkywjuciyfyaqslpnmfuofmfwqbbawcregejpixfexzocnzqxaxpgzkpgtpxozxfqzpgxvbjsvsenxcwjtphiojestyupmcoehtuqvbmagfersasjxmxsgqkgpgnlkdoqvofvodlfuecydvhumskxxagpyojcxznyafztsglroycxaitjshzlphrgfmeouvmiewjodrqjqwxzzeonomurrmmqercqbrbarvtfgbtluhweesrsdyimkkfkcgoskspofqaogrjevwkzdczykpqqhnuwwcuszasdchadxntfybcsmescmfirojwpxmmogktpgxtesndmutvxjvanpbmmiuuioakdubhipjespvoolzcyhoercquijljucadxctwyfdtqlggamgsaqonweaizriqkdfhbnqamhgedmmdxcfthbfkjwhounlovhjkzmhhlsqtmhwzyruyrlqvevtvmfzvsudvhfbjndqnjxkjtqdctwsvyzytaoaagjognotabbcynfpaemxnxtreqaxfkipetzxvaiwlvuojhzfxgobyrtjgivhpqxbmlludvryqxbwoiztqgghfsndjimikeldpbyyoxlwkeyjnkenloazpiknupsmtinuudsernxsyxnxmsaswkehynbihwozilvyqzxpybckecvtthtzcoayrhikxpqbhekitpsiuvpaqcbugzdadxneouazdxtmouyskxanunewzinyzrvmwtvxhtudqhqjmzyirpivnmsgjugdypyljnccostgkwkuqxcxkayhgjkfqpdnngbumfbxugteblkjuksygtwrnnjxrwqhsbnrtawungfnvbznstktygvmflgllrgydzeyqmqongfxbjghepampemnywjhvkfttqcfkyfgxznicoctecpecsnwafnqichbeomhxgecryiboxuissphviwwxghkpktdxwmxwhgwdxgacsqucfxhcwrnmuifkagdjeazfwqmlgdacptzclledovpcppmzdnmmyjjrarbmkyczwxyvxhowjcwrygykxqpgpjityowldknshgefddqayocmjrbbruzaqzouqfvxgicqhumbpsdshgogazplaiypokzaqnqavjxzfjdsvkdnpgkftbljzfhkzvofsedkxkqrjlqdbqnbyxounzsvwicciouhgcorxieeeujuyawgbzndgyclsaeanebrqoqpmwttastcfrcuuidatmaclrzuzgnktoutrabjnyilgihwczhzsllyvmzkobjwubmymumppkscqgsdpwyyttjynehtsopepnfibmmtanerhixqumgdprimsdtwnxtlllfewcdpjvvordhduhovlszvspdburwkrcygwkbaedlwsjzzvmdwkaxcntvjubzozzhuoxelqiewxwpyvvouacavbuykjqntesdrnkawrvvavphgjoqzyuvmthwbptrtopytrikxaimhonmdmckjcqxalbmyzsxvylicpsqjpxxnncwvnooqculgbklkirirrzhaxjrydtuxewrhblntyxlioxqfjbvndlmiozkroldpfyvddfjqxukkktiqyhjtzqpgjwqachoqzpxzzhdccrqniixvoqnxceaelmgslbqegygvrgxnbjlqqdwifglzpaexhetxisyysjcsfrxxqagjiylzgggziehjcbncqmkingoipdfiqojfxqajjgsadrcihytpvlwerttdajujjmrtfdzmmuanryhgnrhpdxjmxrtdoielkrmjsictgbagyuqclutezihnnbcqinyrqqavecbhgnfcrjyisnzxahpgrwbylmrfqngrezdukqthkrosupwjoxevmtzwnirnkrogzcbyrmfwxtgvuxocdmhnpjlahhdieqyvlfirovemnjukjvgubrwkbkfmsxxgbfoehuzspisclbrstlaojcmjdaggqdwiusbyjhzpgnoknatzwhmhzkoxurkkdnawvuovzwobxmimgdonyotogkmaknulduryimzjwweogzxpxcgybrykiumgqubvxsdmvpsoghfddchvrckeewwsejjbiyjammnrwlzqvlhuprhdayngewibkmxhrsqbcywscxsuijienauogjtorjtgzlpusydmxevyuxgivlccdxdtwlbysfgtpmrkbfljnmcbkkuzjmyjxffrozaojminplisqqombucdlcxvllkunjseaydsgkyeourywgzqrtbaqqsposblcepxpszwyrpsqtwbnicdgzhccivoqfawiaywqskghfzrfhvozwsfgynrxtfmifnpfqisyqtlcciryzbwrmxjrkajjwemxesgzwxsljoammndjjkncprbxkknbjrmlrtnyjyvjujcqxojzfwpelrexkfdencarkdrobkjhemffzscygbuamvnlstlulbqcrksqslhkcvcrzinwsnqmaaqutpjkrraispjugafzqcmacxvtupftecowclfrpzaxqtgvwjgjogxtzhofongpzjlbtynerxgtbwllnqsrwysskndhglzdvjvldsnkzekjyqgrsrkustyvevvwgdlbiehzhaimyxxgqlsolsxqkxezxuhpnpctmxtvqfyngdlcieqqmsvztxftbavmhaavxywxjmbmxrptnupwntzepiuomphjqkxnuizlsugmnynzccxdxzmyyzordlwjmgrelksjzyirknazywonnvexofftduxjtkafvsmunnctznwdcoxhfizcrrwefsuheuyknpycvxqkpsfshaurgkokbkgcutvunexkszbgaesyzyqcbmpbinfnxdrwrdsrjbltyhhemuzfasnmkfvrwqlyywawqzqzlpcnipkzfefeaybbxtngwnykwnbyfzmdkychmehjnkhifviaylhoahnfbgfbziyqeqqyvhaartwgeupalemsojsjzxiillbyeyyqlhxmfvrdlkqlttyeqygunezcacxrypphgpwyyvqhcblpnptdubuarivymrmhimawjjzcpcyqdwheqaajqrzqrnagqqzrbvcbxbaajpfyrhbrwtuynziiqjzcdeaixoxydosbhkqbvbtftzlbojtabulcwhbpsmipizfgpiisdylmzzcygbcwlwgfrbkxlrokatzdmttftiqcoqjsrqvevmlaplusxnazdntmhzlviukcriodnkdpyrioenjupuhuvxngukodqejntacdrnakiyyazxevaasfznxplpbogzkmdhhsdosllrsweeqwodioggfxnjektbjgosuadqojlgzdbbokxewqbgstmcwmcgysbeihzytrfsyotzujbagsilcqerxhpkrufqrcahdlyyxqtxojiorhtkhpvdyzhkligfhmcprggssvrvculnaldsdpbsfvghfuojsmyrxywufaoxnvaevmewrammsnuhdwbfstlvpsejwudthhzkowkqunfpgcpkxaoktkdyuadfiuwowgwqowguxliewpvzpkobvghasrvkwwuhbqvfgzwfosyiuwbtnhthqblejhurlbutljpizvjxklncoexofouzpynbjklmnjylxsmcddrqyirdjvukcfaguatiztmkmzeavbbxpywteyjearldyjjrhlxdnyrcezsnbuicrjnkghlxfoudzsszlgfbzrgcqxqlduoumkysthvthdclsanglovjnfmwnptamblglocklgzifibkewfqmbdnyeikixqaezuymukowlkqqaiahdlwrdxtvjquqxshlhqqikbekelahjpfpbprzgmmycffvpivbdbwrhljmwsjlgfvxclmlgzqyknkqfrrlyftgvaqkcuveoqhouqhbmdwmgqftefmrexnjwysrddoeyacohajssvsafhwggvbykvrqnbrmnfusivbaujgkpclxqdiekxrdjbbngugkridgecsafmljqfsfykdbpjpsurnnfvzfogexepxllmyyutthubcsmfjyeuifepdwfjjzlunqnahvobyfzbdjyobblovjhkxdggqolivqgrogvdawdswfebpqoehuyaijzjdwzgomxqviwglfmiaweffvdabfbjtettxvtyjtzjhmarxcblncmdqlvqntzikyrvetfupvwievnksvqmdhpldasckffdqhzdguhapsxrqpwbnelbokthkshslrckrlcvhnrtchoiaveudkcvmxtsaqcjhkitbchikzxbiixrpfqwaiedafvysgmmiazpfxdyhwuzvhwmehveausffiuaobeswfmslbhvxykeppblazxajneasxsngqqaqgssweqffwyrnyvlaiobysswvnktbtzjzwxpddcdkzbumzkgampsrexzvwbhzaajljsbjhjrhsmzpzfrhzwljufcpknbofzznbbkepobxnnwoijhlepfyermkpfedbytppczagvfgocacibimvfqkxzczpxghpefdtkszrqidouwfwucgsvqfkrudmputvsvpzrfepuolkjbmdpukcfmsbpdjnwvhcndrknxhijqafqifrucgictksbmzkzpaaobwsdbpdeqbcerxrenppbytzzyzkdmtdmsifhfnsboopvackptvgiallnddiitensvkisrthwurswtwjykjpcytyplfaknfpncpjzmfekxfjyycdhtphlimjlwwzcbvjicaxswdpyclckajbghzoyoglicryzjioklmizgkbgv';
    const data = { message: testMessage, selectedDevice: deviceID };
    const callableContext = { auth: { uid: uid } }
    const colRef = docRef.collection('messages');
    let messageFound = false

    let prevCol = await colRef.get();

    let messageCollectionSize = prevCol.size;

    const result = await test.wrap(myFunctions.sendData)(data, callableContext);

    expect(result.successCount).to.equal(1);

    let curCol = await colRef.get();

    expect(curCol.size === (messageCollectionSize + 1));
    curCol.forEach(doc => {
      if (doc.get('message') === testMessage) messageFound = true;
    });

    expect(messageFound);
  });
});

describe('deleteDevice', () => {
  it('should delete device and all pending messages', async () => {
    const data = { selectedDevice: deviceID };
    const callableContext = { auth: { uid: uid } };

    return test.wrap(myFunctions.deleteDevice)(data, callableContext)
      .then(() => {
        return firebase.assertFails(docRef.get());
      });
  });

});