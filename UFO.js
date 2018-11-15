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
        "                              ",
        "                              ",
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

    // Forces
    var gravity = new PVector(0, 0.5);
    var jumpForce = new PVector(0, -10);

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
    var hero = new heroObj(0, 340);

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

    heroObj.prototype.draw = function() {
        fill(255, 0, 0);
        pushMatrix();
        translate(this.position.x, this.position.y);
        rect(0, 0, 20, 20);
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
        if (keyArray[RIGHT] === 1) {
            if(this.position.x < (background_width*400) - 20) {
                this.position.x += this.speed;
            }

            // Determine if the screen needs to be translated
            if ((this.position.x > ((400 - scrollval.x) + (0 - scrollval.x))/2) && (scrollval.x > -((background_width-1)*400))) {
                scrollval.x -= this.speed;
            }
        }
        else if(keyArray[LEFT] === 1) {
            if(this.position.x > 0) {
                this.position.x -= this.speed;
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

        if (this.position.y >= 339.99) {
            this.position.y = 340;
            this.velocity.y = 0;
            this.jump = 0;
        }
    };

    //Hanlding key presses
    var keyPressed = function() {
        keyArray[keyCode] = 1;
        if ((keyCode === 32) && (hero.jump === 0)) {
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
        }
        else {
            if((abs(backbutton.position.x - mouseX) <= 60) && (abs(backbutton.position.y - mouseY) <= 20) && gamestate !== 1) {
                gamestate = 0;
            }
        }
    };

    var alienObj = function(x, y) {
        this.x = x; 
        this.y = y; 
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

    var alien1 = new alienObj(0, 0);

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
                drawBackground();
                
                // Snow Fall
                for (var i=0; i<snowflakes.length; i++) {
                    snowflakes[i].move();
                    snowflakes[i].draw();
                }
                displayTilemap();
                
                // Display hero and make him move
                hero.move();
                hero.draw();
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
