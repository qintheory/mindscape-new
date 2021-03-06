var nodes = [];
var nNodes = [];

var width = window.innerWidth,
    height = window.innerHeight;

d3.json("data/greg.json").then(function(links) {
    links.forEach(function(link) {
        if (nodes[link.source.name]){
            link.source = nodes[link.source.name] ;
        }
        else {
            nodes[link.source.name] = {name: link.source};
            nNodes.push(nodes[link.source.name]);
            link.source = nodes[link.source.name] ;
        }
     
        if (nodes[link.target.name]){
            link.target = nodes[link.target.name] ;
        }
        else {
            nodes[link.target.name] = {name: link.target};
            nNodes.push(nodes[link.target.name]);
            link.target = nodes[link.target.name] ;
        } 
    }); 
     
    var svg = d3.select("forum")
        .append("svg")
        .attr("width", width)
        .attr("height", height), 
        g = svg.append("g")
;
    
        // forces
    var r = d3.forceRadial(300),
        x = d3.forceX(width),
        y = d3.forceY(height),
        charge = d3.forceCollide().radius(-80),
        attract = d3.forceManyBody().strength(2),
        center = d3.forceCenter(width/2, height/2),
        collide = d3.forceCollide().radius(35).iterations(5),
        link = d3.forceLink(links).distance(20);
     
    var simulation = d3.forceSimulation(nNodes).alphaTarget(0.5).velocityDecay(0.6)
        .force("charge", charge)
        .force("r", r)
//        .force("x", x)
//        .force("y", y)
        .force("collide", collide)
        .force("center", center)
        .force("link", link);
    
    var zoom = d3.zoom()
        .on("zoom", zoom_actions);

    // create tear drop shape
    var path = g.selectAll("path")
        .attr("class", "path")
        .data(links)
        .enter().append("path")
        .style("fill", "#f7dd16")
        .style("stroke", 'none')
        .style("opacity", "0.5")
        .attr("class", "link").attr("marker-end", "url(#end)");

    var node = g.selectAll("circle")
        .data(nNodes)
      .enter().append("circle")
        .attr("r", 20)
        .style("opacity", 0)
        .call(d3.drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended));

    var text = g.selectAll("text")
        .attr("class", "text")
        .data(nNodes)
        .enter().append("text")
        .attr("x", 3)
        .attr("y", ".3em")
        .style("font-size", function(d){return (d.name.size+2) * 5})
        .style("fill", "aliceblue")
        .style("opacity", 0.6)
        .text(function(d) { return d.name.name; });

    function zoom_actions(){
      g.attr("transform", d3.event.transform);
    }

    function tick() {
        path.attr("d", function(d){
                                 return linkArc(d);
                                });
        node.attr("transform", transform);
        text.attr("transform", transform);
    }

// creation of tear drop shapes
    function linkArc(d) {
      var dx = parseFloat(d.target.x) - parseFloat(d.source.x);
      var dy = parseFloat(d.target.y) - parseFloat(d.source.y);
      var dr = Math.sqrt(dx * dx + dy * dy);
      var r =  d.source.name.size*10; 
      var xPad,
          yPad; 
         
        if(d.target.x < d.source.x) {
            xPad = d.source.x - r;
        } else {
            xPad = d.source.x + r;
        }
        
        if(d.target.y < d.source.y) {
            yPad = d.source.y + r;
        } else {
            yPad = d.source.y - r;
        }
        
        l = Math.sqrt(dx * dx + r * r);   
        let tearWidth = 1.05;
        let path = 
        `M ${d.target.x} ${d.target.y}, 
        Q ${xPad*tearWidth} ${yPad*tearWidth}, ${d.source.x} ${d.source.y}, 
        T ${d.target.x} ${d.target.y},
        Z`;
        
    return path;
    }

    function transform(d) {
      return "translate(" + d.x + "," + d.y + ")";
    }
    
    simulation.on("tick", tick);
    zoom(svg);
    
    /// UI
    $(document).ready(function(){
        console.log("document ready");
        $("#light").hide();
    });

    $("#light").click(function(){
        $("#light").toggle();
        backgroundColor = "light";
        console.log(backgroundColor);
        $("#dark").toggle();
        setBackground();

    })

    $("#dark").click(function(){
        $("#dark").toggle();
        backgroundColor = "dark";
        console.log(backgroundColor);
        $("#light").toggle();
        setBackground();
    })

    function setBackground(){
        if(backgroundColor === "dark"){
        $("body").css({
            "background-color": "#16103b", 
        });
            
        $(".nav-container").css({
            "background-color": "#16103b", 
        });    
            
        path.style("fill", "#f7dd16")
            .style("stroke", "none");
            
        text.style("fill", "aliceblue");    
        console.log("background is light");
        } else {
        $("body").css({
            "background-color": "#669999",
        });
        $(".nav-container").css({
            "background-color": "#669999", 
        });  
            
        path.style("fill", "aliceblue")
            .style("stroke", "#333");
            
        text.style("fill", "#333"); 
            
        console.log("background is dark");
        }
    }    
})
.catch(function(error){
    console.log("error")
});

// drag functions
function dragstarted(d) {
  d3.select(this).raise().classed("active", true);
}

function dragged(d) {
  d3.select(this).select("text")
    .attr("x", d.x = d3.event.x)
    .attr("y", d.y = d3.event.y);
}

function dragended(d) {
  d3.select(this).classed("active", false);
}