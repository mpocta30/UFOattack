// ECE 4525 Video Game Design and Engineering Final Project 
// Title:           UFO Attack 
// Programmers:     Michael Pocta and James D Toussaint
// Description:     The player controls a robot/commando tasked with 
//                  destorying all enemies (UFOs) present on the screen. 
//                  The play area will be initialized via a tilemap. 
//                  The user is presented with a starting screen when the
//                  game initializes. 

var sketchProc=function(processingInstance){ with (processingInstance){
size(400, 400); 
frameRate(60);


    angleMode = "radians";

    var tileMap = [
        "                              ",
        "                              ",
        "                              ",
        "                              ",
        "                              ",
        "                              ",
        "                              ",
        "      w                       ",
        "     www                      ",
        "wwwwwwwwwwwwwwwwwwwwwwwwwwwwww"];

    var gamestate = 0;  // Main menu
    var difficultyval = 0; // Beginner
    var ingamestate = 0;
    var background_width = 3;
    var p2 = [];
    var p = createGraphics(400,400,P3D);
    var cx = -115;
    var cz = 251; 
    var fonts = {
        impact: loadFont("impact",20),
        fh: loadFont("FederationHull",20),
    }; 
    var stars = [];
    var walls = [];
    var bricks = [];
    var snowflakes = [];
    var keyArray = [];
    var initialized = 0;
    var scrollval = new PVector(0, 0);
    var level1_count = 0; 

    // Forces
    var gravity = new PVector(0, 1.5);
    var jumpForce = new PVector(0, -12);

    // Button, background, and tilemap objects
    var menuButtonObj = function(x, y, text) {
        this.position = new PVector(x, y);
        this.text = text;
        this.iterations = 0;
        this.fill = color(34,139,34);
        this.textfill = color(192,192,192);
        this.form = [];
        this.done = 0;
    };
    var ingamemenuButtonObj = function(x, y, text) {
        this.position = new PVector(x, y);
        this.text = text;
        this.iterations = 0;
        this.fill = color(104, 118, 129);
        this.textfill = color(255, 255, 255);
        this.form = [];
        this.done = 0;
    };
    var starType = function() {
        this.x = random(-50, 450);
        this.y = random(-50, 450);
        this.size = random(1, 3);
    };   
    var wallObj = function(x, y) {
        this.x = x;
        this.y = y;
    };
    var snowflakeType = function() {
        this.x = random(-50, 400*background_width + 50);
        this.y = random(-50, 450);
        this.size = random(1, 3);
    };
    var armObj = function() {
        this.position = hero.position;    
        this.angle = 0; 
    };
    var alienObj = function(x, y) {
        this.x = x; 
        this.y = y; 
        this.state = 0; 
        this.speed = 2; 
        this.hits = 5;
        this.step = new PVector(0, 0);
        this.wanderAngle = radians(random(0, 180));
        this.wanderDist = radians(random(70, 100));
    };  
    var bulletObj = function(x, y) {
        this.position = new PVector(x, y); 
        this.dir = new PVector(0, 0); 
        this.show = 0; 
        this.state = 0;
        this.frame = 0;  
    }; 
    var laserObj = function(x, y) {
        this.position = new PVector(0, 0); 
        this.dir = new PVector(0, 0); 
        this.show = 0; 
        this.state = 0; 
        this.frame = 0; 
    };
    var particleObj = function(x, y) {
        this.position = new PVector(x, y);
        //this.velocity = new PVector(random(-0.5, 0.5), random(-0.5, 0.5));	// cartesian
        this.velocity = new PVector(random(0, TWO_PI), random(-1.2, 1.2));
        this.size = random(1, 10);
        this.c1 = random(155, 255);
        this.c2 = random(0, 255);
        this.timeLeft = 100;
    };
    
    var particles = [];

    // // Used to randomly choose colors for bricks
    // var brickObj = function() {
    //     // RGB for bricks
    //     this.r = random(100, 110);
    //     this.g = random(110, 120);
    //     this.b = random(120, 130);
    // };

    // Initialize the player object
    var heroObj = function(x, y) {
        this.position = new PVector(x, y);
        this.speed = 5;
        this.velocity = new PVector(0, 0);
        this.acceleration = new PVector(0, 0);
        this.force = new PVector(0, 0);
        this.currFrame = frameCount;
        this.jump = 0;
        this.hits = 10; 
        this.rot = 0; 
    };

    // Apply force to hero
    heroObj.prototype.applyForce = function(force) {
        this.acceleration.add(force);
    };

    // Subdivision Functions
    var splitPoints = function(points) {
        p2.splice(0, p2.length);
        for (var i = 0; i < points.length - 1; i++) {
            p2.push(new PVector(points[i].x, points[i].y));
            p2.push(new PVector((points[i].x + points[i+1].x)/2, (points[i].y +
    points[i+1].y)/2));
        }  
        p2.push(new PVector(points[i].x, points[i].y));
        p2.push(new PVector((points[0].x + points[i].x)/2, (points[0].y +
    points[i].y)/2));
    };  
    var average = function(points) {
        for (var i = 0; i < p2.length - 1; i++) {
            var x = (p2[i].x + p2[i+1].x)/2;
            var y = (p2[i].y + p2[i+1].y)/2;
            p2[i].set(x, y);
        } 
        var x = (p2[i].x + points[0].x)/2;
        var y = (p2[i].y + points[0].y)/2;
        points.splice(0, points.length);
        for (i = 0; i < p2.length; i++) {
            points.push(new PVector(p2[i].x, p2[i].y));   
        }    
    };    
    var subdivide = function(points) {
        splitPoints(points);
        average(points);
    };

    // Creating background stars
    for (var i= 0; i<200; i++) {
        stars.push(new starType());
        
    }

    // Initialize different colors for bricks
    // for(var i = 0; i < 5; i++) {
    //     for(var j = 0; j < 10; j++) {
    //         bricks.push(new brickObj());
    //     }
    // }

    // Creating background snowflakes
    for (var i= 0; i<200; i++) {
        snowflakes.push(new snowflakeType());
        
    }
    
    // Main Menu Buttons 
    var start = new menuButtonObj(200, 150, 'Start');
    var instructions = new menuButtonObj(200, 200, 'Instructions');
    var difficulty = new menuButtonObj(200, 250, 'Difficulty');
    var mainmenubuttons = [start, instructions, difficulty];

    // Difficulty Buttons
    var beginner = new menuButtonObj(200, 150, 'Beginner');
    var pro = new menuButtonObj(200, 200, 'Pro');
    var expert = new menuButtonObj(200, 250, 'Expert');
    var backbutton = new menuButtonObj(45, 25, 'Back');
    var difficultybuttons = [beginner, pro, expert];

    // In Game Menu
    var menu = new ingamemenuButtonObj(45, 25, 'Menu');
    var controls = new ingamemenuButtonObj(200, 150, 'Controls');
    var quit = new ingamemenuButtonObj(200, 200, 'Quit');
    var ingamemenubuttons = [controls, quit];

    // Hero (user) Object
    var hero = new heroObj(0, 320);

    // construct arm object
    var arm = new armObj(); 
    var bullet = new bulletObj(arm.position.x, arm.position.y); 

    // Draw Functions
    menuButtonObj.prototype.draw = function() {
        // Check if mouse is inside of the button area
        if((abs(this.position.x - mouseX) <= 60) && (abs(this.position.y - mouseY) <= 20)) {
            this.fill = color(192,192,192);
            this.textfill = color(34,139,34);
            
        }
        else {
            this.fill = color(34,139,34);
            this.textfill = color(192,192,192);
        }
        
        //ellipse(this.position.x, this.position.y, 50, 25);
        if (this.done === 0 && this.text !== 'Back') {
            this.form.push(new PVector(this.position.x + 60, this.position.y, this.form));
            this.form.push(new PVector(this.position.x + 60, this.position.y - 20, this.form));
            this.form.push(new PVector(this.position.x, this.position.y - 20, this.form));
            this.form.push(new PVector(this.position.x - 60, this.position.y - 20, this.form));
            this.form.push(new PVector(this.position.x - 60, this.position.y, this.form));
            this.form.push(new PVector(this.position.x - 60, this.position.y + 20, this.form));
            this.form.push(new PVector(this.position.x, this.position.y + 20, this.form));
            this.form.push(new PVector(this.position.x + 60, this.position.y + 20, this.form));
            this.done = 1;
        }
        else if(this.done === 0) {
            this.form.push(new PVector(this.position.x + 40, this.position.y, this.form));
            this.form.push(new PVector(this.position.x + 40, this.position.y - 20, this.form));
            this.form.push(new PVector(this.position.x, this.position.y - 20, this.form));
            this.form.push(new PVector(this.position.x - 40, this.position.y - 20, this.form));
            this.form.push(new PVector(this.position.x - 40, this.position.y, this.form));
            this.form.push(new PVector(this.position.x - 40, this.position.y + 20, this.form));
            this.form.push(new PVector(this.position.x, this.position.y + 20, this.form));
            this.form.push(new PVector(this.position.x + 40, this.position.y + 20, this.form));
            this.done = 1;
        }
        
        // Draw vertices
        fill(this.fill);
        noStroke();
        beginShape();
        for (var i = 0; i < this.form.length; i++) {
            vertex(this.form[i].x, this.form[i].y); 
        }
        vertex(this.size*(this.form[0].x), this.size*(this.form[0].y));
        endShape();
        
        fill(this.textfill);
        textSize(20);
        stroke(0);
        if(this.text === 'Back') {
            text(this.text, this.position.x - (this.text.length/8)*50, this.position.y + 8);  
        }
        else {
            text(this.text, this.position.x - (this.text.length/10)*45, this.position.y + 8);
        }
        
        if (this.iterations < 10) {
            subdivide(this.form);
            this.iterations++;
        } 
    };
    ingamemenuButtonObj.prototype.draw = function() {
        // Check if mouse is inside of the button area
        if((abs(this.position.x - mouseX) <= 60) && (abs(this.position.y - mouseY) <= 20)) {
            this.fill = color(255, 255, 255);
            this.textfill = color(104, 118, 129);
            
        }
        else {
            this.fill = color(104, 118, 129);
            this.textfill = color(255, 255, 255);
        }
        
        //ellipse(this.position.x, this.position.y, 50, 25);
        if (this.done === 0 && this.text !== 'Back') {
            this.form.push(new PVector(this.position.x + 60, this.position.y, this.form));
            this.form.push(new PVector(this.position.x + 60, this.position.y - 20, this.form));
            this.form.push(new PVector(this.position.x, this.position.y - 20, this.form));
            this.form.push(new PVector(this.position.x - 60, this.position.y - 20, this.form));
            this.form.push(new PVector(this.position.x - 60, this.position.y, this.form));
            this.form.push(new PVector(this.position.x - 60, this.position.y + 20, this.form));
            this.form.push(new PVector(this.position.x, this.position.y + 20, this.form));
            this.form.push(new PVector(this.position.x + 60, this.position.y + 20, this.form));
            this.done = 1;
        }
        else if(this.done === 0) {
            this.form.push(new PVector(this.position.x + 40, this.position.y, this.form));
            this.form.push(new PVector(this.position.x + 40, this.position.y - 20, this.form));
            this.form.push(new PVector(this.position.x, this.position.y - 20, this.form));
            this.form.push(new PVector(this.position.x - 40, this.position.y - 20, this.form));
            this.form.push(new PVector(this.position.x - 40, this.position.y, this.form));
            this.form.push(new PVector(this.position.x - 40, this.position.y + 20, this.form));
            this.form.push(new PVector(this.position.x, this.position.y + 20, this.form));
            this.form.push(new PVector(this.position.x + 40, this.position.y + 20, this.form));
            this.done = 1;
        }
        
        // Draw vertices
        fill(this.fill);
        noStroke();
        beginShape();
        for (var i = 0; i < this.form.length; i++) {
            vertex(this.form[i].x, this.form[i].y); 
        }
        vertex(this.size*(this.form[0].x), this.size*(this.form[0].y));
        endShape();
        
        fill(this.textfill);
        textSize(20);
        stroke(0);
        if(this.text === 'Back') {
            text(this.text, this.position.x - (this.text.length/8)*50, this.position.y + 8);  
        }
        else {
            text(this.text, this.position.x - (this.text.length/10)*45, this.position.y + 8);
        }
        
        if (this.iterations < 10) {
            subdivide(this.form);
            this.iterations++;
        } 
    };
    starType.prototype.draw = function() {
        stroke(255,255,255);
        fill(255, 255, 255);
        ellipse(this.x, this.y, this.size, this.size);
    };

    // Draw level background
    var drawBackground = function() {
        // Size of tilemap determines how many mountains in background
        for(var i = 0; i < background_width; i++) {
            stroke(0);
            fill(104, 118, 129);
            arc(i*400+80, 400, 177, 460, radians(180), radians(360));
            arc(i*400+320, 400, 177, 460, radians(180), radians(360));
            noStroke();
            fill(255, 255, 255);
            arc(i*400+80, 205, 96, 73, radians(180), radians(360));
            arc(i*400+320, 205, 96, 73, radians(180), radians(360));
            
            arc(i*400+53, 205, floor(217/5), floor(209/5), 0, radians(180));
            arc(i*400+80, 205, floor(217/5), floor(209/5), 0, radians(180));
            arc(i*400+107, 205, floor(217/5), floor(209/5), 0, radians(180));
            fill(165, 242, 243);
            arc(i*400+53, 205, floor(180/5), floor(177/5), 0, radians(180));
            arc(i*400+80, 205, floor(180/5), floor(177/5), 0, radians(180));
            arc(i*400+107, 205, floor(180/5), floor(177/5), 0, radians(180));
            fill(255, 255, 255);
            arc(i*400+53, 205, floor(190/5), floor(144/5), 0, radians(180));
            arc(i*400+80, 205, floor(190/5), floor(144/5), 0, radians(180));
            arc(i*400+107, 205, floor(190/5), floor(144/5), 0, radians(180));
            
            arc(i*400+240+53, 205, floor(217/5), floor(209/5), 0, radians(180));
            arc(i*400+240+80, 205, floor(217/5), floor(209/5), 0, radians(180));
            arc(i*400+240+107, 205, floor(217/5), floor(209/5), 0, radians(180));
            fill(165, 242, 243);
            arc(i*400+240+53, 205, floor(180/5), floor(177/5), 0, radians(180));
            arc(i*400+240+80, 205, floor(180/5), floor(177/5), 0, radians(180));
            arc(i*400+240+107, 205, floor(180/5), floor(177/5), 0, radians(180));
            fill(255, 255, 255);
            arc(i*400+240+53, 205, floor(190/5), floor(144/5), 0, radians(180));
            arc(i*400+240+80, 205, floor(190/5), floor(144/5), 0, radians(180));
            arc(i*400+240+107, 205, floor(190/5), floor(144/5), 0, radians(180));
            
            stroke(0);
            fill(104, 118, 129);
            arc(i*400+200, 400, 204, 636, radians(180), radians(360));
            noStroke();
            fill(255, 255, 255);
            arc(i*400+200, 130, 107, 97, radians(180), radians(360));
            fill(255, 255, 255);
            
            arc(i*400+115+53, 130, floor(217/5), floor(209/5), 0, radians(180));
            arc(i*400+120+80, 130, floor(217/5), floor(209/5), 0, radians(180));
            arc(i*400+125+107, 130, floor(217/5), floor(209/5), 0, radians(180));
            fill(165, 242, 243);
            arc(i*400+115+53, 130, floor(180/5), floor(177/5), 0, radians(180));
            arc(i*400+120+80, 130, floor(180/5), floor(177/5), 0, radians(180));
            arc(i*400+125+107, 130, floor(180/5), floor(177/5), 0, radians(180));
            fill(255, 255, 255);
            arc(i*400+115+53, 130, floor(190/5), floor(144/5), 0, radians(180));
            arc(i*400+120+80, 130, floor(190/5), floor(144/5), 0, radians(180));
            arc(i*400+125+107, 130, floor(190/5), floor(144/5), 0, radians(180));
        }
    };

    // Tilemap functions
    var initializeTilemap = function () {
        for (var i=0; i<tileMap.length; i++) {
            for (var j=0; j<tileMap[i].length; j++) {
                if (tileMap[i][j] === 'w') {
                    walls.push(new wallObj(j*40, i*40));               
                }
            }
        }
    };
    var displayTilemap = function() {
        for (var i =0; i<walls.length; i++) {
            walls[i].draw();
        }
    };

    wallObj.prototype.draw = function() {
        noStroke();
        fill(104, 118, 129);
        rect(this.x, this.y, 40, 40);
        fill(255, 255, 255);
        arc(this.x+floor(0/10), this.y+floor(0/10), floor(217/10), floor(209/10), 0, radians(90));
        arc(this.x+floor(200/10), this.y+floor(0/10), floor(217/10), floor(209/10), 0, radians(180));
        arc(this.x+floor(400/10), this.y+floor(0/10), floor(217/10), floor(209/10), radians(90), radians(180));
        fill(165, 242, 243);
        arc(this.x+floor(0/10), this.y+floor(0/10), floor(180/10), floor(177/10), 0, radians(90));
        arc(this.x+floor(200/10), this.y+floor(0/10), floor(180/10), floor(177/10), 0, radians(180));
        arc(this.x+floor(400/10), this.y+floor(0/10), floor(180/10), floor(177/10), radians(90), radians(180));
        fill(255, 255, 255);
        arc(this.x+floor(0/10), this.y+floor(0/10), floor(190/10), floor(144/10), 0, radians(90));
        arc(this.x+floor(200/10), this.y+floor(0/10), floor(190/10), floor(144/10), 0, radians(180));
        arc(this.x+floor(400/10), this.y+floor(0/10), floor(190/10), floor(144/10), radians(90), radians(180));
    };

    armObj.prototype.draw = function(ang) {
        // update rotation angle 
        //this.angle = atan2(mouseY-height/2, mouseX-width/2);
        
        pushMatrix(); 
        fill(60, 60, 60); 
        translate(this.position.x + 20, this.position.y + -48); 
        rotate(ang);
        rect(-5, -4, 30, 7); 
        fill(48, 48, 48);
        quad(15, -5, 28, -4, 28, 4, 15, 5); 
        ellipse(0, 0, 12, 12); 
        popMatrix(); 
    };

    heroObj.prototype.draw = function() {
        stroke(0, 0, 0); 
        pushMatrix();
        translate(this.position.x, this.position.y);
        fill(122, 122, 122);
        quad(0, -8, 40, -8, 30, 20, 10, 20); 
        quad(-5, -53, 45, -53, 35, -19, 5, -19);
        rect(5, -86, 28, 22, 5); 
    
        fill(48, 48, 48);
        rect(2, -14, 35, 5, 5);
        rect(1, -19, 37, 5, 5);
        rect(9, -58, 20, 3, 5);
        rect(8, -63, 22, 4, 5);
        rect(-12, 19, 62, 20, 10);
        
        fill(163, 163, 163);
        ellipse(0, 30, 17, 18); 
        ellipse(39, 30, 17, 18);
        // track details
        ellipse(13, 23, 5, 5); 
        ellipse(20, 23, 5, 5); 
        ellipse(27, 23, 5, 5); 
        ellipse(13, 36, 5, 5); 
        ellipse(20, 36, 5, 5); 
        ellipse(27, 36, 5, 5); 


        fill(43, 43, 43); 
        // wheel details for left wheel 
        pushMatrix(); 
        translate(0, 30); 
        rotate(this.rot); 
        ellipse(5, 0, 2, 2); 
        ellipse(-5, 0, 2, 2);
        ellipse(0, -5, 2, 2); 
        ellipse(0, 5, 2, 2);
        popMatrix(); 
        // wheel details for right wheel 
        pushMatrix();
        translate(39, 30); 
        rotate(this.rot); 
        ellipse(5, 0, 2, 2); 
        ellipse(-5, 0, 2, 2);
        ellipse(0, -5, 2, 2); 
        ellipse(0, 5, 2, 2);
        popMatrix();     

        // detail on the head
        fill(194, 0, 0);
        rect(6, -81, 27, 4); 
        fill(41, 41, 41);
        rect(9, -71, 1, 3); 
        rect(13, -71, 1, 3); 
        rect(17, -71, 1, 3); 
        rect(21, -71, 1, 3); 
        rect(25, -71, 1, 3); 
        rect(29, -71, 1, 3); 
    
        popMatrix();
    };

    // Snow for the first level background
    snowflakeType.prototype.draw = function() {
        stroke(255,255,255);
        fill(255, 255, 255);
        ellipse(this.x, this.y, this.size, this.size);
    };

    // Move Functions
    snowflakeType.prototype.move = function() {
        for (var i=0; i<snowflakes.length; i++) {
            //snowflakes[i].x -= 0.25;
            snowflakes[i].y += random(0, 0.03);
            if (snowflakes[i].y < -50) { snowflakes[i].y += 500;}
            if (snowflakes[i].y > 450) { snowflakes[i].y -= 500;}
    }
    };
    heroObj.prototype.move = function() {
        this.acceleration.set(0, 0);
        if (keyArray[68] === 1) {
            if(this.position.x < (background_width*400) - 40) {
                this.position.x += this.speed;
                this.rot += 0.25
            }

            // Determine if the screen needs to be translated
            if ((this.position.x > ((400 - scrollval.x) + (0 - scrollval.x))/2) && (scrollval.x > -((background_width-1)*400))) {
                scrollval.x -= this.speed;
            }
        }
        else if(keyArray[65] === 1) {
            if(this.position.x > 0) {
                this.position.x -= this.speed;
                this.rot -= 0.25;
            }

            // Determine if the screen needs to be translated
            if ((this.position.x < ((400 - scrollval.x) + (0 - scrollval.x))/2) && (scrollval.x < 0)) {
                scrollval.x += this.speed;
            }
        }
        if (this.jump === 2) {
            this.applyForce(jumpForce);
            this.jump = 1;
        }
        if (this.jump > 0) {
            this.applyForce(gravity);
        }
        this.velocity.add(this.acceleration);
        this.position.add(this.velocity);
        this.acceleration.set(0, 0);

        if (this.position.y >= 319.99) {
            this.position.y = 320;
            this.velocity.y = 0;
            this.jump = 0;
        }
    };

    //Hanlding key presses
    var keyPressed = function() {
        keyArray[keyCode] = 1;

        // Press W to jump
        if ((keyCode === 87) && (hero.jump === 0)) {
            hero.jump = 2;
        }
    };
    var keyReleased = function() {
        keyArray[keyCode] = 0;
    };

    // Move Functions
    starType.prototype.move = function() {
        for (var i=0; i<stars.length; i++) {
            stars[i].x -= 0.01;
            stars[i].y -= 0.01;
            if (stars[i].x < -50) { stars[i].x += 500;}
            if (stars[i].x > 450) { stars[i].x -= 500;}
            if (stars[i].y < -50) { stars[i].y += 500;}
            if (stars[i].y > 450) { stars[i].y -= 500;}
    }
    };

    mouseClicked = function() {
        // Difficulty menu
        if(gamestate === 3) {
            if((abs(backbutton.position.x - mouseX) <= 60) && (abs(backbutton.position.y - mouseY) <= 20) && gamestate !== 1) {
                gamestate = 0;
                return;
            }
            for(var i = 0; i < difficultybuttons.length; i++) {
                if((abs(difficultybuttons[i].position.x - mouseX) <= 60) && (abs(difficultybuttons[i].position.y - mouseY) <= 20)) {
                    switch(i) {
                        case 0: difficultyval = 0; break;
                        case 1: difficultyval = 1; break;
                        case 2: difficultyval = 2; break;
                    }
                    
                }
            }
        }
        // Main menu
        else if(gamestate === 0) {
            for(var i = 0; i < mainmenubuttons.length; i++) {
                if((abs(mainmenubuttons[i].position.x - mouseX) <= 60) && (abs(mainmenubuttons[i].position.y - mouseY) <= 20)) {
                    switch(i) {
                        case 0: gamestate = 1; break;
                        case 1: gamestate = 2; break;
                        case 2: gamestate = 3; break;
                    }
                    
                }
            }
        }
        // In game menu
        else if(gamestate === 1) {
            if((abs(menu.position.x - mouseX) <= 60) && (abs(menu.position.y - mouseY) <= 20)) {
                switch(ingamestate) {
                    case 0: ingamestate = 1; break;
                    case 1: ingamestate = 0; break;
                }
            }
            else if((abs(quit.position.x - mouseX) <= 60) && (abs(quit.position.y - mouseY) <= 20)) {
                ingamestate = 0;
                gamestate = 0;
            }
            // in game bullet updates
            if (bullet.state === 0) {
                bullet.dir.set(((mouseX + -scrollval.x) - (bullet.position.x + 20)) / 15, (mouseY - (bullet.position.y - 48)) / 15); 
                bullet.show = 1; 
                bullet.state = 1; 
                bullet.frame = frameCount; 
            }
        }
        else {
            if((abs(backbutton.position.x - mouseX) <= 60) && (abs(backbutton.position.y - mouseY) <= 20) && gamestate !== 1) {
                gamestate = 0;
            }
        }
        
    };

    alienObj.prototype.draw = function() {
        

    // alien body 
    fill(142, 0, 219);
    bezier(30 + this.x, 130 + this.y, 0 + this.x, 35 + this.y, 80 + this.x, 35 + this.y, 50 + this.x, 130 + this.y);
    bezier(93 + this.x, 122 + this.y, 33 + this.x, 180 + this.y, 82 + this.x, 156 + this.y, 93 + this.x, 122 + this.y); 
    bezier(40 - 53 + this.x, 122 + this.y, 47 + this.x, 180 + this.y, 40 - 42 + this.x, 156 + this.y, 40 - 53 + this.x, 122 + this.y); 


    // eye 
    fill(94, 255, 0);
    ellipse(40 + this.x, 88 + this.y, 20, 16); 
    // fangs 
    noStroke(); 

    fill(255, 255, 255);
    triangle(34 + this.x, 110 + this.y, 38 + this.x, 110 + this.y, 36 + this.x, 120 + this.y); 
    triangle(41 + this.x, 110 + this.y, 45 + this.x, 110 + this.y, 43 + this.x, 120 + this.y); 
    fill(255, 0, 0);
    // eyeball 
    triangle(40 + this.x, 82 + this.y, 38 + this.x, 88 + this.y, 42 + this.x, 88 + this.y); 
    triangle(40 + this.x, 94 + this.y, 38 + this.x, 88 + this.y, 42 + this.x, 88 + this.y); 
    stroke(0, 0, 0);
    // ship body 
    fill(87, 87, 87);
    rect(15 + this.x, 130 + this.y, 49, 10, 5); 

    fill(178, 255, 245, 75);
    triangle(63 + this.x, 145 + this.y, 93 + this.x, 146 + this.y, 95 + this.x, 115 + this.y); 
    triangle(40 - 23 + this.x, 145 + this.y, 40 - 53 + this.x, 146 + this.y, 40 - 55 + this.x, 115 + this.y);  
    // ship lower body 
    fill(163, 163, 163);
    ellipse(40 + this.x, 156 + this.y, 155, 31); 
    fill(87, 87, 87);
    rect(-1 + this.x, 146 + this.y, 5, 5); 
    rect(-1 + this.x, 156 + this.y, 5, 5); 
    rect(9 + this.x, 156 + this.y, 5, 5); 
    noStroke();
    fill(255, 0, 0);
    ellipse(12 + this.x, 159 + this.y, 3, 3); 
    fill(13, 255, 0);
    ellipse(2 + this.x, 159 + this.y, 3, 3); 



    // glass dome 
    stroke(0, 0, 0);
    fill(178, 255, 245, 75);
    bezier(20 + this.x, 130 + this.y, -20 + this.x, 10 + this.y, 100 + this.x, 10 + this.y, 60 + this.x, 130 + this.y); 
    };

    alienObj.prototype.move = function() {
        // fly in state 
        if (this.state === 0) {
            this.x = this.x - 4; 
            // transition to normal state
            if (dist(this.x, this.y, hero.position.x, hero.position.y) < 350) {
                this.state = 1; 
            }
        }
        else if (this.state === 1) {
            this.x = this.x - this.speed; 
            if (this.x < 0) {
                this.speed = -this.speed; 
            }
            else if (this.x > 400 * background_width) {
                this.speed = -this.speed; 
            }
        }
        // if hit five times, transition back to state 0 
        if (this.hits === 0) {
            // generate explosion
            for (var i = 0; i < 200; i++) {
                particles.push(new particleObj(this.x + 40, this.y + 140));
            }
            this.state = 0; 
            this.x += 750; 
            this.hits = 5;
            
            if (this.speed < 0) { this.speed = -this.speed }
        }
        
    };
    
    alienObj.prototype.wander = function() {
            this.step.set(cos(this.wanderAngle), sin(this.wanderAngle));
            this.x += this.step.x;
            this.y += this.step.y;
            this.wanderAngle += radians(random(-30, 30));
            this.wanderDist--;
            if (this.wanderDist < 0) {
                this.wanderDist = random(70, 100);
                this.wanderAngle += radians(random(-90, 90));
            }
                    
            if (this.x > 420) {this.x = -20;}
            else if (this.x < -20) {this.x = 420;}
            if (this.y > 420) {this.y = -20;}
            else if (this.y < -20) {this.y = 420;}
        };

    particleObj.prototype.move = function() {
        var v = new PVector(this.velocity.y*cos(this.velocity.x),
        this.velocity.y*sin(this.velocity.x));
    
        this.position.add(v);	
        //this.position.add(this.velocity);	// cartesian
        this.timeLeft--;
    };
    
    particleObj.prototype.draw = function() {
        noStroke();
        fill(this.c1, this.c2, 0, this.timeLeft);
        ellipse(this.position.x, this.position.y, this.size, this.size);
    };

    var alien1 = new alienObj(0, 0);
    var aliens = [new alienObj(hero.position.x + 500, -20)];
    var lasers = [new laserObj(40 + aliens[0].x, 156 + aliens[0].y)];
    
    bulletObj.prototype.draw = function(ang) {
        pushMatrix();
        translate(this.position.x + 20, this.position.y + -48); 
        fill(209, 2, 2);
        ellipse(23*cos(ang), 23*sin(ang), 4, 4); 
        popMatrix(); 
    };
    
    bulletObj.prototype.move = function() {
        // bound checking 

        // state behavior 
        if (this.state === 0) {
            this.position.set(arm.position.x, arm.position.y); 
            // transitions to state 1 when the mouse clicks 
        }
        else if (this.state === 1) {
            this.position.add(this.dir); 
            // transition back to state 0 
            if (frameCount - this.frame > 35) {
                this.state = 0; 
                this.show = 0; 
            }
        }
        // check collisions with bullets 
        for (var i = 0; i < aliens.length; i++) {
            if ((dist(aliens[i].x + 39, aliens[i].y + 107, this.position.x, this.position.y) < 50 ||
                 dist(15 + aliens[i].x, 130 + aliens[i].y, this.position.x, this.position.y) < 30) && this.show === 1) {
                aliens[i].hits--;
                this.show = 0;  
            }
        }
    };

    laserObj.prototype.draw = function() {
        pushMatrix(); 
        translate(this.position.x, this.position.y); 
        fill(0, 240, 0); 
        ellipse(0, 0, 4, 4); 
        popMatrix(); 
    };

    laserObj.prototype.move = function() {
        // state behavior 
        if (this.state === 0) {
            this.position.set(40 + aliens[0].x, 156 + aliens[0].y);
            // transition to fired state 
            if (aliens[0].state !== 0 && abs(this.position.x - hero.position.x) < 200) {
                this.dir.set(((hero.position.x + 20) - this.position.x + random(-15, 15)) / 25, ((hero.position.y - 55) - this.position.y + random(-10, 10)) / 25); 
                this.frame = frameCount; 
                this.show = 1; 
                this.state = 1; 
            }
        }
        else if (this.state === 1) {
            this.position.add(this.dir); 
            if (frameCount - this.frame > 40) {
                this.state = 2; // transition back to non-fired state 
                this.show = 0; 
                this.frame = frameCount; 
            }
            // check for collision with the player 
            if ((dist(hero.position.x + 30, hero.position.y - 55, this.position.x, this.position.y) < 30  ||
                dist(hero.position.x + 30, hero.position.y - 20, this.position.x, this.position.y) < 30) && this.show === 1) {
                if (hero.hits > 0) {
                    hero.hits--; 
                }
                this.show = 0; 
            }
        }
        else if (this.state === 2) { // cooldown state 
            if (frameCount - this.frame > 50) {
                this.state = 0; 
            }
        }
    };
    

    var draw = function() {
        // Main Menu
        if(gamestate === 0) {
            if(!p.background){
                return;
            }            
            
            p.background(0);
            p.angleMode="degrees";
            p.beginDraw();
            p.lights();
        
            // UFO
            p.pushMatrix();
            p.fill(34,139,34);
            p.textSize(95);
            p.scale(1.4,1,1);
            p.translate(66, 50, 0);
            for(var a=0; a<5; a++){
                p.text("UFO",0,0);
                p.translate(0,0,3);
            }
            p.popMatrix();
            
            // ATTACK
            p.pushMatrix();
            p.fill(34,139,34);
            p.textSize(95);
            p.scale(1.2,1,1);
            p.translate(9, 356, 0);
            for(var a=0; a<5; a++){
                p.text("ATTACK",0,0);
                p.translate(0,0,3);
            }
            p.popMatrix();
            
            p.noLights();
            p.endDraw();
        
            image(p,0,0);
            
            for(var i = 0; i < mainmenubuttons.length; i++) {
                mainmenubuttons[i].draw();   
            }
            
            // Stars
            for (var i=0; i<stars.length; i++) {
                stars[i].move();
                stars[i].draw();
            }

            // names
            textSize(14); 
            text("Designed by Michael Pocta and David Toussaint", 50, 382, 1000, 50);
            
            // Draw alien
            alien1.draw();
            alien1.wander();
        }
        // Gameplay
        else if(gamestate === 1) {
            background(135, 206, 235);
            menu.draw();
            if(ingamestate === 1) {
                for(var i = 0; i < ingamemenubuttons.length; i++) {
                    ingamemenubuttons[i].draw();   
                }
            }
            else {
                if(initialized === 0) {
                    initializeTilemap();
                    initialized = 1;
                }
                translate(scrollval.x, scrollval.y);
                // Mountains
                //drawBackground();
                
                // Snow Fall
                /*for (var i=0; i<snowflakes.length; i++) {
                    snowflakes[i].move();
                    snowflakes[i].draw();
                }*/
                displayTilemap();
                
                // Display hero and make him move
                hero.move();
                hero.draw();
                var ang = atan2(mouseY-height/2, mouseX-width/2);
                arm.draw(ang);
                if (bullet.show === 1) {
                    bullet.draw(); 
                    
                }
                bullet.move(); 
                // Display aliens
                for (var i = 0; i < aliens.length; i++) {
                    aliens[i].draw(); 
                    aliens[i].move(); 
                }
                for (var i = 0; i < lasers.length; i++) {
                    if (lasers[i].show === 1) {
                        lasers[i].draw(); 
                    }
                    lasers[i].move();
                }
                // explosions 
                for (var i=0; i<particles.length; i++) {
                    if (particles[i].timeLeft > 0) {
                        particles[i].draw();
                        particles[i].move();
                    }
                    else {
                        particles.splice(i, 1);
                    }
                }

                //fill(255, 0, 0);
                //text(aliens[0].x, 100, 100, 100, 100); 
                //text(lasers[0].position.x, 100, 200, 100, 100); 
                textSize(14); 
                fill(24, 24, 24)
                text("Health:", 250 + abs(scrollval.x), 380, 100, 100);
                text("Destroyed", 250 + abs(scrollval.x), 10, 100, 100); 
                text(level1_count, 320 + abs(scrollval.x), 10, 100, 100); 
                text("/ 5 Aliens", 330 + abs(scrollval.x), 10, 1000, 100); 

                fill(230, 0, 0);
                rect(300 + abs(scrollval.x), 380, 7*hero.hits, 10); 
            }
        }
        // Instructions
        else if(gamestate === 2) {
            background(0);
            backbutton.draw();
            fill(34,139,34);
            textSize(21);
            text("You control one of Earth\'s last warriors: a nameless COMMANDO. He is motivated by nothing but hate for the invaders. He will not stop until the MOTHERSHIP has been wiped from existence. He is master of every weapon. Your mission is simple: destroy every UFO you see. Use whatever the fallen enemies drop to aid you- and SURVIVE.", 20, 60, 360, 400);
            backbutton.draw();
            
            // Stars
            for (var i=0; i<stars.length; i++) {
                stars[i].move();
                stars[i].draw();
            }
        }
        // Difficulty
        else if(gamestate === 3) {
            background(0);
            
            
            for(var i = 0; i < difficultybuttons.length; i++) {
                difficultybuttons[i].draw();   
            }
            backbutton.draw();
            fill(34,139,34);
            switch(difficultyval) {
                case 0: triangle(difficultybuttons[0].position.x - 80, difficultybuttons[0].position.y - 20, difficultybuttons[0].position.x - 80, difficultybuttons[0].position.y + 20, difficultybuttons[0].position.x - 60, difficultybuttons[0].position.y);
                    alien1.x = difficultybuttons[0].position.x + 90; 
                    alien1.y = difficultybuttons[0].position.y - 155;
                break;
                case 1: triangle(difficultybuttons[1].position.x - 80, difficultybuttons[1].position.y - 20, difficultybuttons[1].position.x - 80, difficultybuttons[1].position.y + 20, difficultybuttons[1].position.x - 60, difficultybuttons[1].position.y);
                    alien1.x = difficultybuttons[1].position.x + 90; 
                    alien1.y = difficultybuttons[1].position.y - 155;
                break;
                case 2: triangle(difficultybuttons[2].position.x - 80, difficultybuttons[2].position.y - 20, difficultybuttons[2].position.x - 80, difficultybuttons[2].position.y + 20, difficultybuttons[2].position.x - 60, difficultybuttons[2].position.y);
                    alien1.x = difficultybuttons[2].position.x + 90; 
                    alien1.y = difficultybuttons[2].position.y - 155;
                break;
            }
            
            // Stars
            for (var i=0; i<stars.length; i++) {
                stars[i].move();
                stars[i].draw();
            }
            
            // draw alien
            stroke(0, 0, 0);
            alien1.draw();
            
        }
    };
}};
