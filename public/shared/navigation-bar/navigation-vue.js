Vue.component('nav-bar',{
    data:function(){
        return{
            wish_list:'../Wish-List/wish-list.html',
            gallery:'../Gallery/gallery.html',
            music:'../Music/music.html',
            stack_of_papers:'../Stack-of-Papers/stacks-of-papers.html',
            films:'../Films/films.html'
        }
    },
	template:
	`
    <div>
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
        <a class="navbar-brand" href="../Index/index.html">Lil Haoss</a>
        <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarContents"
            aria-controls="navbarContents" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
        </button>
    
        <div class="collapse navbar-collapse" id="navbarContents">
            <ul class="navbar-nav mr-auto">
                <li class="nav-item">
                    <a class="nav-link" :href="wish_list">Wish List</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" :href="gallery">Gallery</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" :href="music">Beating</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" :href="stack_of_papers">Paper</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" :href="films">Films</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link disabled" href="#">Still Developing...</a>
                </li>
            </ul>
        </div>
    </nav>
	</div>
	`
 })

 new Vue({
	el:"#navbar-holder",
})


//     <div class="collapse navbar-collapse" id="navbarContents">
//     <ul class="navbar-nav mr-auto">
//         <li class="nav-item">
//             <a class="nav-link" href="wish_list">Wish List</a>
//         </li>
//         <li class="nav-item">
//             <a class="nav-link" href="gallery">Gallery</a>
//         </li>
//         <li class="nav-item">
//             <a class="nav-link" href="music">Beating</a>
//         </li>
//         <li class="nav-item">
//             <a class="nav-link" href="stack_of_papers">Paper</a>
//         </li>
//         <li class="nav-item">
//             <a class="nav-link" href="films">Films</a>
//         </li>
//         <li class="nav-item">
//             <a class="nav-link disabled" href="#">Still Developing...</a>
//         </li>
//     </ul>
// </div>