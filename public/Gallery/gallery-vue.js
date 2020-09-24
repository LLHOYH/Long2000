import { firestore, storage } from "../shared/firebase/firebase-key.js";
import  GalleryComponent  from "../Gallery/gallery-component.js";
var storageRef = storage.ref();
var galleryCollection = firestore.collection("gallery");

const sub_collection="Images";
var albumNames=[];
var selectedAlbum;
var newAlbumName;

var upload=new Vue({
	el:"#uploadSection",
	data:{
		albumNames,
		selectedAlbum,
		newAlbumName,
	},
    methods:{

		LoadAlbums:function(){
			galleryCollection.get().then((result)=>{
				result.docs.forEach((doc,index)=>{
					if(index===0)
					this.selectedAlbum=doc.id;
					albumNames.push(doc.id);
				})
				if(albumNames.length>0)
					this.selectedAlbum=albumNames[0];
				else
					this.selectedAlbum="No Album Yet";
			});
		},
		OnAlbumChange:function(albumName,event){
			event.preventDefault();
			this.selectedAlbum=albumName;
		},
		OnAddingNewAlbumClick:function(event){
			console.log(typeof(this.newAlbumName.trim()));
			event.preventDefault();
			//if new AlbumName is not null or undefined, set the name to be selected
			this.selectedAlbum= this.newAlbumName!==undefined && this.newAlbumName.trim()!== ''? this.newAlbumName.trim(): this.selectedAlbum;
		},
        OnFilesChange:function(){
            preview.SetPreviews();
        },
        SubmitClicked:function(){
            preview.UploadToFirebase();
		},
	},	
	beforeMount(){
		this.LoadAlbums();
	},
	mounted(){
		document.getElementById('albumTextBox').addEventListener('keyup',function(event){
			event.preventDefault();
			if(event.key==='Enter'){
				document.getElementById('albumSubmitBtn').click();
			}
		})
	}
})


var previewImgs = [];

var preview = new Vue({
	el: "#previewSection",
	data: {
		previewImgs: previewImgs
	},
	methods: {
		SetPreviews: function (e) {
			var files = document.getElementById("imageUpload").files;
			this.previewImgs = [];
			let counter = 0;
			for (let file of files) {
				this.previewImgs.push({
					id: counter,
					imgUrl: URL.createObjectURL(file),
					imgName: file.name,
					imgUploading: false,
					uploadError: false,
					uploadProgress: 0,
				});
				counter++;
			}
		},
		RemovePreview: function (e) {
			//as index of img is set as the parent div's id, get the index number
			let idToRemove = e.target.parentElement.id;
			let urlToRemove = e.target.parentElement.querySelector(".imgs").src;

			//remove the file from files
			this.DeleteSelectedPreview(idToRemove, urlToRemove);
		},
		DeleteSelectedPreview: function (imgId, imgUrl) {
			//remove 1 item at that index and remove the image URL from memory
			console.log(`id: ${imgId}`);
			URL.revokeObjectURL(imgUrl);

			var index = this.previewImgs.map((img) => {
                return img.id;
            }).indexOf(Number(imgId));

			if (index != -1) this.previewImgs.splice(index, 1);
		},
		UploadToFirebase: async function () {

			let uploadPromise = this.previewImgs.map(async (img) => {
				var galleryAlbum = document.querySelector("#albumToUpload").innerText;

				img.uploadError = false;
				img.imgUploading = true;

				let imgPath = "images/" + galleryAlbum + "/" + img.imgName;
				let imagesRef = storageRef.child(imgPath);
				let blob = await fetch(img.imgUrl).then((r) => r.blob());

				//upload the image itself to cloud storage
				var uploadTask = imagesRef.put(blob);

				uploadTask.on("state_changed", function (snapshot) {
						img.uploadProgress = parseInt(
							(snapshot.bytesTransferred / snapshot.totalBytes) * 100
						);

						//set upload progress to 99, leave 1% to upload into firestore
						img.uploadProgress =
							img.uploadProgress == 100 ? 99 : img.uploadProgress;
					},
					function (error) {
						// Handle unsuccessful uploads
						img.uploadError = true;
					},
					async function () {
						// Handle successful uploads on complete

						//if the images are going to upload into a new album, set the fields in the new album
						let field = await galleryCollection.doc(galleryAlbum).get().then((field)=>{
							return field.data();
						})
						if(field===undefined)
							await galleryCollection.doc(galleryAlbum).set({
									AlbumDate: new Date(),
									AlbumDescription:''
							})
						
						//upload the image path to firestore
						await galleryCollection.doc(galleryAlbum).collection(sub_collection).doc().set({
								imgPath: imgPath,
							}).then(() => {
								//set progress to 100 when done.
								img.uploadProgress = 100;
								preview.DeleteSelectedPreview(img.id, img.imgUrl);
							});
					}
				);
			});
		},
	},
});



var albums=[];
var albumImages=[];
var clickedAlbumNames=[];
var selectedAlbumName;
var showComponent='album';
var gallery = new Vue({
	el: "#galleryAlbumSection",
	data: {
		albums,
		albumImages,
		selectedAlbumName,
		clickedAlbumNames,
		showComponent
	},
	methods: {
		GetAllGalleryAlbums: function () {
			//get all albums 
			galleryCollection.onSnapshot((snapshot) => {
				snapshot.docs.map(async (doc) => {

					//get in deeper into the album and retrieve the image in the album
					let [imagePath, imgNum] = await galleryCollection.doc(doc.id).collection(sub_collection)
                            .get().then(result=>{
								if(result.docs.length===0)
									return [null,null];
								

								//return the latest image in the album as a cover image and number of images in an album using array destructuring
								let imgPath=result.docs[result.docs.length-1].data().imgPath;
								let imgNum=result.docs.length;

								return [imgPath, imgNum.toString()];
                            }, error=>{
								console.log(`Getting image from album ${doc.id} failed. Error: ${error}`, 'color:red;font-weight:bold;')
								return [null,null];
							});
						

						//if image path is null, use default images.
						let coverImgUrl = imagePath!==null ? await storageRef.child(imagePath).getDownloadURL() : "../shared/images/no_image_yet.png";
						
							
						let albumDate = doc.data().AlbumDate.toDate();

					this.albums.push({
                        albumName: doc.id,
                        albumDate: albumDate.getFullYear()+'/'+(albumDate.getMonth()+1)+'/'+albumDate.getDate(),
                        albumDescription: doc.data().AlbumDescription,
						albumImgCover:coverImgUrl,
						isShowingImages:false,
						//albumImages:[],
						imgNum
					});
				});
			});
		},
		ShowImages(albumName,event){
			if(event)
				event.preventDefault();
				
			if(this.selectedAlbumName!==albumName)
				this.selectedAlbumName=albumName;

				this.showComponent='albumImages';

				//check if this album has already been clicked before and is stored in the clickedAlbumNames array
			if(this.clickedAlbumNames.includes(albumName)) 
  				return; //end current function if yes.


			//if does not include, add it to the array and request for following images
			this.clickedAlbumNames.push(albumName);
			galleryCollection.doc(albumName).collection(sub_collection).onSnapshot(snapshot=>{
						
				//loop through each document
				//use docChanges() instead of just doc.
				//docChanges returns new changes to the firebase
				//it triggers when snapshot is being taken for the first time, and any addition, modification and deletion of documents.
				snapshot.docChanges().forEach(async change => {

					var imagePath = change.doc.data().imgPath;

					//use the path from firestore to get the image itself from storage.
					let imgUrl = await storageRef.child(imagePath).getDownloadURL();
					
					if(change.type==="added"){
						//and use the firebase storage's item downloadable link to render the img.
						this.albumImages.push({
							id: change.doc.id,
							imgUrl: imgUrl,
							albumName:albumName
						});
					}
					else if(change.type==="modified"){
						let modifiedImg = this.albumImages.find(img=>img.id===change.doc.id);
						modifiedImg.imgUrl=imgUrl;
					}
					else if(change.type==="removed"){
						this.albumImages.splice(this.albumImages.findIndex(img=>img.id), 1);
					}
				})
			})
		}
	},
	computed:{
		Selected_Album_Images(){
			let filteredImgs=[]
			this.albumImages.forEach((img)=>{
				if(img.albumName === this.selectedAlbumName)
				filteredImgs.push(img);
			})
			return filteredImgs;
			//return this.albumImages.filter(img=>{ img.albumName === this.selectedAlbumName });
		}
	},
	beforeMount() {
		this.GetAllGalleryAlbums();
	}
});

