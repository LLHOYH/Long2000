export default{
    'album':{
        template:
        `
        <div id="album" class="flex-list flex-list-center">
        <div v-for="album in albums" :key="album.albumName" v-bind:id="album.albumName"
            class="flex-column-1 albumDiv " @click="ShowImages(album.albumName, $event)">
            <div class="albumCoverImgsContainer">
                <div class="albumNameContainer">
                    <p class="albumName">{{album.albumName}}</p>
                    <p class="albumImgNum" v-if="album.imgNum">{{album.imgNum}}</p>
                </div>
                <img v-bind:src="album.albumImgCover" class="img-thumbnail albumCoverImgs"
                    alt="Image Could Not Load..." onerror="this.src='../shared/images/no_image_yet.png'">
            </div>
            <div class="border-bottom"></div>
            <p>{{album.albumDate}}</p>
            <p>{{album.albumDescription}}</p>


        </div>
    </div>
        `,
        methods:{
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
        }
    },
    'albumImages':{
        template:
        `
        <div id="albumImage" style="width:100%">
        <a class="material-icons" @click="showComponent='album'" style="cursor: pointer;">
            arrow_back_ios
        </a>
        <div class="albumImageDiv flex-list flex-list-spaceBtw">
            <div v-for="albumImage in Selected_Album_Images" :key="albumImage.id" v-bind:id="albumImage.id">
                <img v-bind:src="albumImage.imgUrl" class="img-thumbnail imgs">
            </div>
        </div>
        </div>
    `
    }
}