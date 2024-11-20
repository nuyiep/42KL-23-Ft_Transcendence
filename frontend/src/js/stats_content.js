import { loadUserAvatar } from "./settings/upload_avatar.js";
import { getRequest } from "./network_utils/api_requests.js";
import { currentUserInfo } from "./global_vars.js";

export async function loadStatsPage() {
  try {
    // Get match stats from your API
    // console.log("Fetching match stats...");
    const matchStats = await getRequest('/api/game_stats/match-stats/');
    const container = document.querySelector('.scrollable-container');
    // if (!container) {
    //     console.error("Could not find .scrollable-container");
    //     return;
    // }

    container.innerHTML = ''; // Clear existing content

    if (!matchStats || matchStats.length === 0) {
      const noMatchesDiv = document.createElement('div');
      noMatchesDiv.className = 'no-matches';
      noMatchesDiv.textContent = 'No match history found';
      container.appendChild(noMatchesDiv);
      return;
    }

    // Group matches by date
    const matchesByDate = groupMatchesByDate(matchStats);
    // console.log("Grouped matches:", matchesByDate);

    // Create sections for each date
    for (const [date, matches] of Object.entries(matchesByDate)) {
      const section = createDateSection(date, matches);
      container.appendChild(section);
    }

    // Add click handlers to all match records
    document.querySelectorAll('.match-record').forEach(record => {
		record.addEventListener('click', () => {
		  // Get the match ID from the data attribute
		  const matchId = record.getAttribute('data-match-id');
		  loadMatchDetails(matchId);
		  
		  // Remove highlight from all records and highlight the clicked one
		  document.querySelectorAll('.match-record').forEach(r => 
			r.classList.remove('selected'));
		  record.classList.add('selected');
		});
	  });

  } catch (error) {
    console.error('Error loading match history:', error);
  }
}

function groupMatchesByDate(matches) {
  const grouped = {};
  matches.forEach(match => {
    const date = new Date(match.created_at);
    const dateKey = formatDate(date);
    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
    }
    grouped[dateKey].push(match);
  });
  return grouped;
}

function formatDate(date) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}, ${days[date.getDay()]}`;
}

function formatTime(date) {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  // more than 12 is PM, less than 12 is AM
  const ampm = hours >= 12 ? 'pm' : 'am';
  // Convert to 12 hour format
  const formattedHours = hours % 12 || 12;
  // minutes always have 2 digits
  const formattedMinutes = minutes.toString().padStart(2, '0');
  // e.g. 13:05 to 1:05 PM
  return `${formattedHours}:${formattedMinutes}${ampm}`;
}

function createDateSection(date, matches) {
  const section = document.createElement('div');
  section.className = 'record-section';

  // Date header
  const dateDiv = document.createElement('div');
  dateDiv.className = 'date';
  dateDiv.textContent = date;
  section.appendChild(dateDiv);

  // Match records
  matches.forEach(match => {
    const matchRecord = createMatchRecord(match);
    section.appendChild(matchRecord);
  });

  return section;
}

function createMatchRecord(match) {
  const recordDiv = document.createElement('div');
  recordDiv.className = 'match-record';
  recordDiv.setAttribute('data-match-id', match.id);

  // Determine if current user was player1 or player2
  const isPlayer1 = match.pong_match?.player1?.id === currentUserInfo.id;

  // Create player sections based on whether current user was player1 or player2
  const userSection = createPlayerSection(
    isPlayer1 ? match.pong_match?.player1 : match.pong_match?.player2,
    // ?: is a ternary operator (boolean value: player 1 or player 2)
    // ?. optional chaining operator (if the value before the ?. is null or undefined, the expression after the ?. is not evaluated)
    'current-player'
  );

  const opponentSection = createPlayerSection(
    isPlayer1 ? match.pong_match?.player2 : match.pong_match?.player1,
    'opponent'
  );

  // Create score section with scores arranged based on player position
  const scoreSection = createScoreSection(match, isPlayer1);

  // Always show current user on the left
  recordDiv.appendChild(userSection);
  recordDiv.appendChild(scoreSection);
  recordDiv.appendChild(opponentSection);

  return recordDiv;
}

function createPlayerSection(player, playerClass) {
  const section = document.createElement('div');
  section.className = 'game-stats-avatar-section';

  const avatarContainer = document.createElement('div');
  avatarContainer.className = 'avatar-container';

  const avatar = document.createElement('img');
  avatar.className = 'avatar';
  avatar.alt = 'avatar';
  avatar.src = '/static/images/kirby.png'; // Default avatar
  if (player?.id) {
    loadUserAvatar(avatar, player.id);
  }

  avatarContainer.appendChild(avatar);

  const name = document.createElement('div');
  name.className = 'avatar-name';
  const playerName = player?.username || 'Player 2';
  name.textContent = playerName;
  name.title = playerName; // Show full name on hover, use HTML title attribute

  section.appendChild(avatarContainer);
  section.appendChild(name);

  return section;
}

function createScoreSection(match, isPlayer1) {
  const section = document.createElement('div');
  section.className = 'score-time-section';

  const score = document.createElement('div');
  score.className = 'score';

  // Display scores based on whether current user was player1 or player2
  const userScore = isPlayer1 ? match.pong_match?.p1_score : match.pong_match?.p2_score;
  const opponentScore = isPlayer1 ? match.pong_match?.p2_score : match.pong_match?.p1_score;
  score.textContent = `${userScore || 0} - ${opponentScore || 0}`;

  // Win/loss styling
  if (userScore > opponentScore) {
    score.style.backgroundColor = 'var(--teal-500)';
  } else {
    score.style.backgroundColor = 'var(--magenta-500)';
  }

  const time = document.createElement('div');
  time.className = 'time';
  time.textContent = formatTime(new Date(match.created_at));

  section.appendChild(score);
  section.appendChild(time);

  return section;
}

export async function loadMatchDetails(matchId) {
	try {
	  const matchStats = await getRequest(`/api/game_stats/match-stats/${matchId}/`);
      console.log('Full match stats:', matchStats);
      console.log('Match type:', matchStats.pong_match?.type);
	  const matchStatsContainer = document.getElementById('match-stats-container');
	  const content = matchStatsContainer.querySelector('.content');
	  
	  content.innerHTML = generateMatchStatsHTML(matchStats);

      const p1Avatar = document.getElementById('p1-avatar');
      const p2Avatar = document.getElementById('p2-avatar');

      if (matchStats.pong_match?.player1?.id) {
        loadUserAvatar(p1Avatar, matchStats.pong_match.player1.id);
      }

      if (matchStats.pong_match?.player2?.id) {
        loadUserAvatar(p2Avatar, matchStats.pong_match.player2.id);
     }
	} catch (error) {
	  console.error('Error loading match details:', error);
	}
  }

  function generateMatchStatsHTML(stats) {
	// Format duration into minutes and seconds
    console.log('Stats in generate HTML:', stats);
    console.log('Pong match:', stats.pong_match);
    console.log('Game type received:', stats.pong_match?.type);
	const duration = stats.match_duration ? formatDuration(stats.match_duration) : 'N/A';
    const gameDate = formatDate(new Date(stats.created_at));
    const gameTime = formatTime(new Date(stats.created_at));
    const gameType = stats.pong_match?.type;
    const formattedGameType = formatGameType(gameType);
	
    // Paddle bounces
    const totalBounces = stats.p1_paddle_bounces + stats.p2_paddle_bounces;
    const maxWidth = 450;
    let p1Width, p2Width;
    
    if (totalBounces === 0) {
        p1Width = maxWidth / 2;
        p2Width = maxWidth / 2;
    } else {
        p1Width = (stats.p1_paddle_bounces / totalBounces) * maxWidth;
        p2Width = (stats.p2_paddle_bounces / totalBounces) * maxWidth;
    }
    
    // Color switches
    const totalSwitches = stats.p1_color_switches + stats.p2_color_switches;
    let p1SwitchWidth, p2SwitchWidth;
    
    if (totalSwitches === 0) {
        p1SwitchWidth = maxWidth / 2;
        p2SwitchWidth = maxWidth / 2;
    } else {
        p1SwitchWidth = (stats.p1_color_switches / totalSwitches) * maxWidth;
        p2SwitchWidth = (stats.p2_color_switches / totalSwitches) * maxWidth;
    }

    // Wall Hits
    const totalWallHits = stats.p1_points_lost_by_wall_hit + stats.p2_points_lost_by_wall_hit;
    let p1WallWidth, p2WallWidth;
    
    if (totalWallHits === 0) {
        p1WallWidth = maxWidth / 2;
        p2WallWidth = maxWidth / 2;
    } else {
        p1WallWidth = (stats.p1_points_lost_by_wall_hit / totalWallHits) * maxWidth;
        p2WallWidth = (stats.p2_points_lost_by_wall_hit / totalWallHits) * maxWidth;
    }
    
    // Wrong Color Hits
    const totalWrongColorHits = stats.p1_points_lost_by_wrong_color + stats.p2_points_lost_by_wrong_color;
    let p1WrongColorWidth, p2WrongColorWidth;
    
    if (totalWrongColorHits === 0) {
        p1WrongColorWidth = maxWidth / 2;
        p2WrongColorWidth = maxWidth / 2;
    } else {
        p1WrongColorWidth = (stats.p1_points_lost_by_wrong_color / totalWrongColorHits) * maxWidth;
        p2WrongColorWidth = (stats.p2_points_lost_by_wrong_color / totalWrongColorHits) * maxWidth;
    }

	return `
	  <div class="match-stats-details">

        <div class="match-record-large">
          <div class="game-stats-avatar-section">
            <div class="avatar-container">
              <img class="avatar" src="/static/images/kirby.png" alt="avatar" id="p1-avatar">
            </div>
            <div class="avatar-name" id="p1-name">${stats.pong_match?.player1?.username || 'Player 1'}</div>
          </div>
        
          <div class="score-time-section">
            <div class="score" id="match-score" style="background-color: ${stats.pong_match?.p1_score > stats.pong_match?.p2_score ? 'var(--teal-500)' : 'var(--magenta-500)'}">
              ${stats.pong_match?.p1_score || 0} - ${stats.pong_match?.p2_score || 0}
            </div>

            <div class=match-stats-game-details>
                <div class="match-stats-game-details-row">Duration: ${duration}</div>
                <div class="match-stats-game-details-row">Date: ${gameDate}</div>
                <div class="match-stats-game-details-row">Time: ${gameTime}</div>
                <div class="match-stats-game-details-row">Type: ${formattedGameType}</div>
          </div>
          </div>
        
          <div class="game-stats-avatar-section">
            <div class="avatar-container">
              <img class="avatar" src="/static/images/kirby.png" alt="avatar" id="p2-avatar">
            </div>
            <div class="avatar-name" id="p2-name">${stats.pong_match?.player2?.username || 'Player 2'}</div>
          </div>
        </div>


        <!-- Paddle Bounces Graph -->
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 90">
        <text x="300" y="30" font-family="Arial" font-size="18" fill="var(--charcoal-200)" text-anchor="middle" >Paddle Bounces</text>
    
        <text x="20" y="70" font-family="Arial" font-size="18" fill="var(--charcoal-100)">${stats.p1_paddle_bounces}</text>
        <text x="580" y="70" font-family="Arial" font-size="18" fill="var(--charcoal-100)">${stats.p2_paddle_bounces}</text>    
        
        <g transform="translate(80, -30)">
            <!-- Paddle bounces -->
            <rect x="0" y="80" width="${p1Width}" height="30" fill="var(--yellow-500)" rx="4"/>
            <rect x="${p1Width}" y="80" width="${p2Width}" height="30" fill="var(--blue-500)" rx="4"/>
            //rx is for rounded corners
        </g>
    </svg>


        <!-- Color Switches Graph -->
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 90">
            <text x="300" y="30" font-family="Arial" font-size="18" fill="var(--charcoal-200)" text-anchor="middle">Color Switches</text>
            <text x="20" y="70" font-family="Arial" font-size="18" fill="var(--charcoal-100)">${stats.p1_color_switches}</text>
            <text x="580" y="70" font-family="Arial" font-size="18" fill="var(--charcoal-100)">${stats.p2_color_switches}</text>    
            
            <g transform="translate(80, -30)">
                <rect x="0" y="80" width="${p1SwitchWidth}" height="30" fill="var(--yellow-500)" rx="4"/>
                <rect x="${p1SwitchWidth}" y="80" width="${p2SwitchWidth}" height="30" fill="var(--blue-500)" rx="4"/>
            </g>
        </svg>
    
        <!-- Wall Hits Graph -->
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 90">
            <text x="300" y="30" font-family="Arial" font-size="18" fill="var(--charcoal-200)" text-anchor="middle">Wall Hits</text>
        
            <text x="20" y="70" font-family="Arial" font-size="18" fill="var(--charcoal-100)">${stats.p1_points_lost_by_wall_hit}</text>
            <text x="580" y="70" font-family="Arial" font-size="18" fill="var(--charcoal-100)">${stats.p2_points_lost_by_wall_hit}</text>    
            
            <g transform="translate(80, -30)">
                <rect x="0" y="80" width="${p1WallWidth}" height="30" fill="var(--yellow-500)" rx="4"/>
                <rect x="${p1WallWidth}" y="80" width="${p2WallWidth}" height="30" fill="var(--blue-500)" rx="4"/>
            </g>
        </svg>
        
        <!-- Wrong Color Hits Graph -->
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 150">
            <text x="300" y="30" font-family="Arial" font-size="18" fill="var(--charcoal-200)" text-anchor="middle">Wrong Color Hits</text>
        
            <text x="20" y="70" font-family="Arial" font-size="18" fill="var(--charcoal-100)">${stats.p1_points_lost_by_wrong_color}</text>
            <text x="580" y="70" font-family="Arial" font-size="18" fill="var(--charcoal-100)">${stats.p2_points_lost_by_wrong_color}</text>    
            
            <g transform="translate(80, -30)">
                <rect x="0" y="80" width="${p1WrongColorWidth}" height="30" fill="var(--yellow-500)" rx="4"/>
                <rect x="${p1WrongColorWidth}" y="80" width="${p2WrongColorWidth}" height="30" fill="var(--blue-500)" rx="4"/>
            </g>

        </svg>
	  </div>
	`;
  }

  function formatDuration(duration) {
	// Parse the duration string (e.g., "00:05:23")
	const [hours, minutes, seconds] = duration.split(':').map(Number);
	
	if (hours > 0) {
	  return `${hours}h ${minutes}m ${Math.round(seconds)}s`;
	} else if (minutes > 0) {
	  return `${minutes}m ${Math.round(seconds)}s`;
	} else {
	  return `${Math.round(seconds)}s`;
	}
  }

  function formatGameType(type) {
    switch(type) {
        case 'local_classic':
            return 'Local Play';
        case 'online_classic':
            return 'Online Play';
        case 'online_tournament':
            return 'Tournament';
        default:
            console.log('Unknown game type:', type);
            return type || 'Unknown Type';
    }
}