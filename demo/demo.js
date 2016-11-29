var waiting = true;
var state = "Searching";
var mypoke;
var opponent;
var found;
var wins = 0;
var losses = 0;
var pokeballs = 0;
var team = [];
var inbattle = false;
var replaceme = false;

function savePokeWins(){
    team.some(function (poke, idx) {
        if (poke.id === mypoke.id) {
            team[idx].wins = mypoke.wins;
            team[idx].losses = mypoke.losses;
            return true;
        }
    });
}

function addToTeam() {
    savePokeWins();
    team[team.length] = opponent;
    mypoke = opponent;
    mypoke.wins = 0;
    mypoke.losses = 0;
    $("#poke").html("");
    $("#poke").append(render("player", mypoke));
    $("#battle").fadeOut();
    renderTeam();
    battle();
}

function doCatch() {
    if (pokeballs > 0) {
        inbattle = false;
        pokeballs--;
        center($("#catching"));
        $("#catching").css({ top: "75%" });

        state = "Using Pokeball";
        waiting = true;

        $("#catching").fadeIn(1000, function () {
            $("#catching").fadeOut(1000, function () {
                $("#catching").fadeIn(1000, function () {
                    $("#catching").fadeOut(1000, function () {
                        if (Math.random() > .7) {
                            if (team.length === 6) {
                                replaceme = true;
                                $("#teamdialog").dialog();
                                $("#teamdialog").show();
                            } else {
                                addToTeam();
                            }
                        } else {
                            state = "The Pokemon Broke Free";
                            waiting = false;
                        }

                        $("#pokeballs").html(pokeballs);
                    });
                });
            });
        });
    } else {
        state = "No Pokeballs";
    }
}

function render(who, poke) {
    var $elem = $($("#poketemplate").html());
    $elem.addClass(who);
    function appendImage() {
        $elem.find(".img").addClass(poke.name.toLowerCase());
    }
    appendImage();
    $elem.find(".name").html(poke.name);
    $elem.find(".types").html("");
    poke.types.forEach(function (type) {
        $elem.find(".types").append("<span style='display: inline-block;' class='poketype poketype-" +
            type + "'>" + type + "</span>")
    });
    $elem.find(".types").hide();
    return $elem;
}

function search() {
    window.setTimeout(function () {
        found = pokemon.getRandom();
        waiting = false;
        state = "Pokemon Found";
        $("#poke").html("");
        $("#poke").append(render("player", found));
        $("#catch").fadeIn(2000);
        center($("#catch"));
        $(".ash").hide();
    }, Math.random() * 10000);
}

function battle() {
    window.setTimeout(function () {
        $("#score").show();
        inbattle = true;
        $(".ash").hide();
        $("#battle").hide();
        opponent = pokemon.getRandom();
        state = "Battle";
        waiting = false;
        var $elem = render("opponent", opponent);
        var $div = $("<div class='inner'></div>");
        var $player = $("#poke").find(".player").clone();
        $player.css({display: "inline-block"});
        $div.append($player);
        $div.append($elem);
        $("#poke").hide();
        $("#battle").html("");
        $("#battle").append($div);
        $("#battle .types").hide();
        $("#battle").append($("#battle-control").clone());
        $("#battle #battle-control").show();
        center($("#battle"));
        $("#battle").fadeIn(2000);

        function doBattle() {
            inbattle = false;
            replaceme = false;
            $("#battle #battle-control").detach();
            var result = pokemon.battle(mypoke, opponent);
            if (result.win) {
                wins++;
                mypoke.wins++;
                pokeballs++;
            } else {
                losses++;
                mypoke.losses++;
            }
            $("#wins").html(wins);
            $("#losses").html(losses);
            $("#pokeballs").html(pokeballs);

            function anim(elem, win, then) {
                var color = ["F","E","D","C","B","A",9,8,7,6,5,4,3,2,1];
                var index = 0;
                var letter = "F";

                function step(){
                    window.setTimeout(function () {
                        elem.css({ background: win ? "#FF" + letter + color[index] + letter + color[index] :
                        "#" + letter + color[index] + "FF" + letter + color[index] });
                        index++;
                        if (index < color.length) {
                            step();
                        } else if (letter === "F") {
                            index = 0;
                            letter = "E";
                            step();
                        } else {
                            if (then) then();
                        }
                    },150);
                }
                step();
            }

            $("#battle .winner").hide();
            if (result.player > 1) {
                $("#battle .player .winner").css({ color: "red" }).text("weakness");
            } else if (result.player < 1) {
                $("#battle .player .winner").css({ color: "green" }).text("resistance");
            }

            if (result.opponent > 1) {
                $("#battle .opponent .winner").css({ color: "red" }).text("weakness");
            } else if (result.opponent < 1) {
                $("#battle .opponent .winner").css({ color: "green" }).text("resistance");
            }

            $("#battle .winner").fadeIn(4000);
            $("#battle .types").fadeIn(3000);

            anim($("#battle .opponent"), result.win);
            anim($("#battle .player"), !result.win, function () {
                if ((result.win && mypoke.evolve && mypoke.wins === 10) ||
                    (result.win && mypoke.evolve && mypoke.wins === 25)) {
                    $("#evolve").html("<div>" + mypoke.name + " evolved into " + mypoke.evolve.name + ".</div>");

                    var w = mypoke.wins;
                    var l = mypoke.losses;

                    team.some(function (poke, idx) {
                        if (poke.id === mypoke.id) {
                            team.splice(idx, 1);
                        }
                    });

                    mypoke = pokemon.getPokemon(mypoke.evolve.id);
                    mypoke.wins = w;
                    mypoke.losses = l;

                    team.push(mypoke);
                    renderTeam();

                    $("#poke").html("");
                    $("#poke").append(render("player", mypoke));
                }

                $("#log").prepend($("#battle").html());
                $("#log").css({ top: $(window).height() + "px", left: ($(window).width()/2) - ($("#log").width() / 2) + "px" });

                $("#battle").fadeOut(5000, battle);
            });
        }

        $("#battle #battle-go").click(doBattle);
        $("#battle #battle-catch").click(doCatch);

    }, (Math.random() * 10000) + 10000);

    center($(".ash"));
    $(".ash").show();

    state = "Finding Pokemon";
    waiting = true;
}

function renderTeam() {
    $(".team").html("");
    team.forEach(function (poke,idx) {
        var img = $("<div class='img " + poke.name.toLowerCase() + "'></div>");
        img.css ({ margin: "2px", cursor: "pointer" });
        img.click(function () {
            if (inbattle) {
                savePokeWins();
                mypoke = poke;
                $("#battle .player").detach();
                $("#poke").html("");
                $("#poke,#battle .inner").prepend(render("player", mypoke));
            } else if (replaceme) {
                $("#teamdialog").dialog("close");
                team.splice(idx, 1);
                replaceme = false;
                addToTeam();
            }
        });
        $(".team").append(img);
    });
    $(".team").fadeIn(2000);
}

function center(elem){
    elem.css({ top: ($(window).height()/2) - (elem.height() / 2) + "px", left: ($(window).width()/2) - (elem.width() / 2) + "px" });
}

$(document).ready(function () {

    $("#yes").click(function () {
        team[team.length] = found;
        mypoke = found;
        mypoke.wins = 0;
        mypoke.losses = 0;
        $("#catch").hide();
        renderTeam();
        battle();
    });

    $("#no").click(function () {
        $(".ash").show();
        $("#catch").hide();
        state = "Searching";
        waiting = true;
        found = null;
        search();
    });

    window.setInterval(function () {
        if (waiting) {
            if ($("#state").html().indexOf(".....") > -1) {
                $("#state").html(state);
            } else {
                $("#state").html(state + ($("#state").html().match(/\.{1,4}/) || [""])[0] + ".");
            }
        } else {
            $("#state").html(state);
        }
    }, 200);

    window.setInterval(function(){
        if ($(".ash").hasClass("ash1")) {
            $(".ash").removeClass("ash1").addClass("ash2");
        } else {
            $(".ash").removeClass("ash2").addClass("ash1");
        }
    },500);

    $(".team").css({ top: ($(window).height()/2) - 300 + "px" });
    center($(".ash"));

    search();

});