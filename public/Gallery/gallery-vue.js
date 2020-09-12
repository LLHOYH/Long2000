import { firestore, storage } from "../shared/firebase/firebase-key.js";

var storageRef = storage.ref();
var galleryCollection = firestore.collection("gallery");

const sub_collection="Images";

var albumNames=[];
var selectedAlbum;

var upload=new Vue({
	el:"#uploadSection",
	data:{
		albumNames:albumNames,
		selectedAlbum:selectedAlbum
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
		OnAlbumChange:function(albumName){
			this.selectedAlbum=albumName;
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
				var galleryAlbum = "Family";

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

var gallery = new Vue({
	el: "#galleryAlbumSection",
	data: {
		albums: albums
	},
	methods: {
		GetAllGalleryAlbums: function () {
			//get all albums 
			galleryCollection.onSnapshot((snapshot) => {
				snapshot.docs.map(async (doc) => {

					//get in deeper into the album and retrieve the image in the album
					let [imagePath, imgNum] = await galleryCollection.doc(doc.id).collection(sub_collection)
                            .get().then(result=>{
								if(result.docs.length===0){
									console.log("return null");
									return [null,null];
								}

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
						
                            
					albums.push({
                        albumName: doc.id,
                        albumDate: doc.data().AlbumDate,
                        albumDescription: doc.data().AlbumDescription,
						albumImgCover:coverImgUrl,
						isShowingImages:false,
						albumImages:[],
						imgNum
                    });
				});
			});
		},
		OpenAlbum:function(albumName, event){//return all images in the album as a cover image
			if(event)
				event.preventDefault();

			//first, check if this current clicked album was already clicked by checking if it is showing it's album images.
			var selectedAlbum = albums.find(album=>album.albumName===albumName);
			//if it's album images are showing, end current function
			if(selectedAlbum.isShowingImages)
				return false;

			//make the clicked album's detail show
			selectedAlbum.isShowingImages=true;

			//and change other album's that are showing to not showing by using filter
			albums.filter(album=>album.isShowingImages && album.albumName!==albumName).forEach(album=>{album.isShowingImages=false;});
			
			//right now check if album already has contained albumImages
			//if yes, end the function
			if(selectedAlbum.albumImages.length>0)
				return false;

			//if not, get albumImages from firebase
			galleryCollection.doc(albumName).collection(sub_collection).onSnapshot(snapshot=>{
				console.log(snapshot.docChanges())
				
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
						selectedAlbum.albumImages.push({
							id: change.doc.id,
							imgUrl: imgUrl
						});
					}
					else if(change.type==="modified"){
						let modifiedImg = selectedAlbum.albumImages.find(img=>img.id===change.doc.id);
						modifiedImg.imgUrl=imgUrl;
					}
					else if(change.type==="removed"){
						selectedAlbum.albumImages.splice(selectedAlbum.albumImages.findIndex(img=>img.id), 1);
					}
				})
			})
		}
	},
	beforeMount() {
		this.GetAllGalleryAlbums();
	},
});








// function DownloadImageWithUrl(url) {
//     // This can be downloaded directly:
// 	var xhr = new XMLHttpRequest();
//     xhr.responseType = "blob";
    
// 	xhr.onload = function (event) {
//         var blob = xhr.response;
//         console.log(blob);
//     };
//     xhr.open("GET", url);
// 	xhr.send();
// 	return url;
// }
