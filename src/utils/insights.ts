import { TrackFeatures, ModelPredictions, ListeningInsights } from '@/types';
import { mean, standardDeviation } from './helpers';

/**
 * Generate human-readable insights from listening data and model predictions
 */
export const generateInsights = (
  tracks: TrackFeatures[],
  predictions: ModelPredictions
): ListeningInsights => {
  const insights: ListeningInsights = {
    mood: generateMoodInsight(tracks, predictions),
    energy: generateEnergyInsight(tracks, predictions),
    timing: generateTimingInsight(tracks),
    diversity: generateDiversityInsight(tracks),
    patterns: generatePatternInsights(tracks, predictions)
  };

  return insights;
};

/**
 * Generate mood-related insights
 */
const generateMoodInsight = (
  tracks: TrackFeatures[],
  predictions: ModelPredictions
): string => {
  const avgValence = mean(tracks.map(t => t.valence));
  const predictedValence = predictions.mood_prediction.valence;
  
  if (predictedValence > 0.7) {
    if (avgValence > 0.7) {
      return "Your music taste consistently leans towards positive, uplifting tracks. You seem to use music to maintain or boost your mood.";
    } else {
      return "While your recent tracks show varied emotions, your listening pattern suggests a preference for uplifting music when making future choices.";
    }
  } else if (predictedValence < 0.3) {
    if (avgValence < 0.3) {
      return "You gravitate towards more melancholic or introspective music. This could indicate you use music for emotional processing or prefer deeper, more complex emotions.";
    } else {
      return "Your model predicts a shift towards more contemplative music choices, possibly indicating a change in mood or preference.";
    }
  } else {
    return "Your music taste spans a balanced emotional range, suggesting you adapt your listening to different moods and situations.";
  }
};

/**
 * Generate energy-related insights
 */
const generateEnergyInsight = (
  tracks: TrackFeatures[],
  predictions: ModelPredictions
): string => {
  const avgEnergy = mean(tracks.map(t => t.energy));
  const energyVariance = standardDeviation(tracks.map(t => t.energy));
  const predictedEnergy = predictions.mood_prediction.energy;
  
  if (avgEnergy > 0.7) {
    if (energyVariance < 0.2) {
      return "You consistently prefer high-energy, danceable music. Your listening style suggests you use music for motivation and activity.";
    } else {
      return "While you enjoy high-energy music, you also appreciate variety in intensity, showing adaptability in your musical preferences.";
    }
  } else if (avgEnergy < 0.3) {
    return "You gravitate towards calmer, more relaxed tracks. This suggests you often use music for relaxation, focus, or introspection.";
  } else {
    const energyTrend = predictedEnergy > avgEnergy ? "increasing" : "decreasing";
    return `Your energy preferences are moderate and balanced. The model predicts your next choices will trend towards ${energyTrend} energy levels.`;
  }
};

/**
 * Generate timing-related insights
 */
const generateTimingInsight = (tracks: TrackFeatures[]): string => {
  const hours = tracks.map(t => t.hour_of_day * 24); // Convert back from normalized
  const avgHour = mean(hours);
  const weekendTracks = tracks.filter(t => t.is_weekend > 0.5).length;
  const weekendRatio = weekendTracks / tracks.length;
  
  let timeInsight = "";
  
  if (avgHour < 6) {
    timeInsight = "You're a night owl, with most listening happening in the early morning hours.";
  } else if (avgHour < 12) {
    timeInsight = "You're an early bird listener, preferring morning music sessions.";
  } else if (avgHour < 18) {
    timeInsight = "Your listening patterns center around afternoon hours, possibly during work or study.";
  } else {
    timeInsight = "You're an evening listener, enjoying music during nighttime hours.";
  }
  
  if (weekendRatio > 0.7) {
    timeInsight += " Your listening heavily skews towards weekends, suggesting music is part of your leisure time.";
  } else if (weekendRatio < 0.3) {
    timeInsight += " You listen more during weekdays, possibly as part of your work or commute routine.";
  } else {
    timeInsight += " Your listening is well-distributed across weekdays and weekends.";
  }
  
  return timeInsight;
};

/**
 * Generate diversity-related insights
 */
const generateDiversityInsight = (tracks: TrackFeatures[]): string => {
  // Calculate diversity across multiple dimensions
  const features = ['danceability', 'energy', 'valence', 'acousticness', 'instrumentalness'] as const;
  const diversityScores = features.map(feature => 
    standardDeviation(tracks.map(t => t[feature]))
  );
  
  const avgDiversity = mean(diversityScores);
  
  if (avgDiversity > 0.25) {
    return "Your music taste is highly diverse, spanning different genres, moods, and styles. You're an adventurous listener who enjoys exploring various musical landscapes.";
  } else if (avgDiversity > 0.15) {
    return "You have a moderately diverse music taste with some consistency in preferences. You enjoy variety while maintaining certain stylistic preferences.";
  } else {
    return "Your music taste shows strong consistency and focus. You have well-defined preferences and tend to stay within your comfort zone.";
  }
};

/**
 * Generate pattern-specific insights
 */
const generatePatternInsights = (
  tracks: TrackFeatures[],
  predictions: ModelPredictions
): string[] => {
  const patterns: string[] = [];
  
  // Analyze skip patterns
  const avgSkipRate = mean(tracks.map(t => t.skip_rate));
  if (avgSkipRate > 0.3) {
    patterns.push("You tend to skip tracks frequently, suggesting you're selective about what holds your attention.");
  } else if (avgSkipRate < 0.1) {
    patterns.push("You rarely skip tracks, indicating strong satisfaction with your music choices or patient listening habits.");
  }
  
  // Analyze repeat patterns
  const avgRepeatCount = mean(tracks.map(t => t.repeat_count));
  if (avgRepeatCount > 0.2) {
    patterns.push("You frequently replay songs, suggesting you develop strong attachments to particular tracks.");
  }
  
  // Analyze musical key preferences
  const keyDistribution = analyzeKeyDistribution(tracks);
  if (keyDistribution.dominantKey !== null) {
    const keyNames = ['C', 'C♯/D♭', 'D', 'D♯/E♭', 'E', 'F', 'F♯/G♭', 'G', 'G♯/A♭', 'A', 'A♯/B♭', 'B'];
    patterns.push(`You show a preference for music in ${keyNames[keyDistribution.dominantKey]}, which might contribute to a consistent harmonic feel in your listening.`);
  }
  
  // Analyze tempo patterns
  const tempoAnalysis = analyzeTempoPatterns(tracks);
  if (tempoAnalysis.variance < 0.1) {
    patterns.push(`Your tempo preferences are consistent, clustering around ${tempoAnalysis.dominantRange} BPM.`);
  } else {
    patterns.push("Your tempo preferences vary widely, showing adaptability to different rhythmic environments.");
  }
  
  // Analyze acoustic vs electronic preference
  const acousticPreference = analyzeAcousticPreference(tracks);
  if (acousticPreference > 0.7) {
    patterns.push("You strongly prefer acoustic and organic-sounding music over electronic productions.");
  } else if (acousticPreference < 0.3) {
    patterns.push("You lean towards electronic and heavily produced music over acoustic arrangements.");
  }
  
  // Confidence-based insights
  if (predictions.confidence_scores.mood > 0.8) {
    patterns.push("Your mood preferences are highly predictable, showing consistent emotional patterns in your music choices.");
  }
  
  if (predictions.confidence_scores.next_track > 0.8) {
    patterns.push("Your listening patterns are highly consistent, making your next music choices quite predictable.");
  }
  
  return patterns.length > 0 ? patterns : ["Your listening patterns show interesting complexity that requires more data to fully understand."];
};

/**
 * Analyze musical key distribution
 */
const analyzeKeyDistribution = (tracks: TrackFeatures[]): {
  dominantKey: number | null;
  distribution: number[];
} => {
  const keyCount = new Array(12).fill(0);
  
  tracks.forEach(track => {
    const key = Math.round(track.key * 11); // Convert from normalized back to 0-11
    keyCount[key]++;
  });
  
  const maxCount = Math.max(...keyCount);
  const dominantKey = maxCount > tracks.length * 0.2 ? keyCount.indexOf(maxCount) : null;
  
  return {
    dominantKey,
    distribution: keyCount.map(count => count / tracks.length)
  };
};

/**
 * Analyze tempo patterns
 */
const analyzeTempoPatterns = (tracks: TrackFeatures[]): {
  variance: number;
  dominantRange: string;
} => {
  const tempos = tracks.map(t => t.tempo * 150 + 50); // Convert from normalized (assuming 50-200 BPM range)
  const variance = standardDeviation(tempos) / mean(tempos); // Coefficient of variation
  
  const avgTempo = mean(tempos);
  let dominantRange: string;
  
  if (avgTempo < 80) {
    dominantRange = "slow (60-80)";
  } else if (avgTempo < 110) {
    dominantRange = "moderate (80-110)";
  } else if (avgTempo < 140) {
    dominantRange = "upbeat (110-140)";
  } else {
    dominantRange = "fast (140+)";
  }
  
  return { variance, dominantRange };
};

/**
 * Analyze acoustic vs electronic preference
 */
const analyzeAcousticPreference = (tracks: TrackFeatures[]): number => {
  // Combine acousticness and instrumentalness as indicators of acoustic preference
  const acousticScores = tracks.map(t => 
    (t.acousticness * 0.7) + (t.instrumentalness * 0.3) - (t.energy * 0.2)
  );
  
  return mean(acousticScores);
};

/**
 * Generate personalized recommendations based on insights
 */
export const generateRecommendations = (
  tracks: TrackFeatures[],
  predictions: ModelPredictions
): string[] => {
  const recommendations: string[] = [];
  
  const avgValence = mean(tracks.map(t => t.valence));
  const avgEnergy = mean(tracks.map(t => t.energy));
  
  // Mood-based recommendations
  if (predictions.mood_prediction.valence > avgValence + 0.2) {
    recommendations.push("Try exploring more uplifting genres like reggae, pop-punk, or upbeat folk music.");
  } else if (predictions.mood_prediction.valence < avgValence - 0.2) {
    recommendations.push("Consider diving into contemplative genres like ambient, melancholic indie, or classical music.");
  }
  
  // Energy-based recommendations
  if (predictions.mood_prediction.energy > avgEnergy + 0.2) {
    recommendations.push("You might enjoy high-energy genres like electronic dance music, punk rock, or Latin rhythms.");
  } else if (predictions.mood_prediction.energy < avgEnergy - 0.2) {
    recommendations.push("Explore calming genres like lo-fi hip hop, acoustic folk, or meditation music.");
  }
  
  // Diversity recommendations
  const diversity = generateDiversityInsight(tracks);
  if (diversity.includes("consistent")) {
    recommendations.push("Challenge yourself by exploring a new genre outside your comfort zone this week.");
  } else if (diversity.includes("diverse")) {
    recommendations.push("Your diverse taste is excellent! Consider creating themed playlists to organize your broad preferences.");
  }
  
  return recommendations;
};
