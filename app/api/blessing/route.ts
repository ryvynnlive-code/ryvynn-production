import { NextRequest, NextResponse } from 'next/server';

// Curated, crisis-safe blessings. No clinical claims, no false promises —
// dignity, staying, and worth. Dual Flame voice.
const BLESSINGS_EN: string[] = [
  "You woke up carrying something heavy, and you carried it anyway. That is not small. That is strength wearing ordinary clothes.",
  "The fact that you are still here, still breathing through this, means the story is not over. Stay for the next page.",
  "You do not have to be fixed to be worthy. You are worthy right now, exactly as you are, in the middle of the hard part.",
  "Somewhere ahead of you is a version of you that is glad you didn't quit today. Be kind to them. Get them there.",
  "The light you can't feel right now is not gone. It is just waiting on the other side of this hour.",
  "You are allowed to rest. Healing is not a race, and slow is still forward.",
  "Whatever you survived to get here, it did not get the last word. You did. You're still speaking.",
  "Your softness is not weakness. It takes a strong person to keep feeling in a world that asked them to go numb.",
  "You don't owe anyone the brightest version of yourself today. Showing up at all is enough.",
  "The same hands that are shaking right now have held you through every worst day so far. They are still holding.",
  "You are not too much. You were just surrounded, for a while, by people with too little room.",
  "Breathe in. You are here. Breathe out. You made it to now. That is a quiet kind of victory.",
  "Be gentle with yourself the way you would be with someone you love. You are someone worth loving like that.",
  "The night doesn't last because it's stronger than the morning. It lasts because the morning is still on its way.",
  "You have already survived one hundred percent of your hardest days. Your record is unbroken.",
  "What you're feeling is real, and it is also not forever. Both are true. Let the second one carry you.",
  "You are not behind. You are on a road only you can walk, at a pace only your soul understands.",
  "Even now, even like this — you matter. Not for what you produce. For the simple, stubborn fact that you exist.",
  "Let today be enough. You don't have to win the whole war tonight. Just hold the line of your own breath.",
  "The cracks in you are not damage. They are where everything you've learned got in, and where your light gets out.",
  "You are someone's reason, even if no one has told you yet. Stay long enough to find out who.",
  "It's okay to lay the weight down for a moment. The ground can hold it. The ground can hold you.",
  "Your pain is proof of how deeply you can care. One day that same depth will become your joy.",
  "You don't have to believe in yourself today. Just borrow my belief in you until yours comes back.",
  "Stay. Not because it's easy, but because you are needed in a tomorrow you cannot see yet.",
  "The bravest thing you did today might be invisible to everyone but you. It still counts. It counts most.",
  "You are not the darkness you passed through. You are the one who kept walking. That is who you really are.",
  "Whatever brought you here, you are safe in this moment. Let this moment be a place to set the weight down.",
];

const BLESSINGS_ES: string[] = [
  "Despertaste cargando algo pesado, y lo cargaste de todos modos. Eso no es poca cosa. Es fortaleza vestida de ropa común.",
  "El hecho de que sigas aquí, respirando a través de esto, significa que la historia no ha terminado. Quédate para la siguiente página.",
  "No tienes que estar arreglado para tener valor. Vales ahora mismo, tal como eres, en medio de lo difícil.",
  "La luz que no puedes sentir ahora no se ha ido. Solo está esperando al otro lado de esta hora.",
  "Ya sobreviviste el cien por ciento de tus días más difíciles. Tu récord sigue intacto.",
  "No eres demasiado. Solo estuviste rodeado, por un tiempo, de gente con muy poco espacio.",
  "Respira. Estás aquí. Llegaste hasta ahora. Esa es una victoria silenciosa.",
  "Quédate. No porque sea fácil, sino porque haces falta en un mañana que aún no puedes ver.",
];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lang = (searchParams.get('lang') || 'en').toLowerCase();
  const pool = lang.startsWith('es') ? BLESSINGS_ES : BLESSINGS_EN;
  const index = Math.floor(Math.random() * pool.length);
  return NextResponse.json({
    blessing: pool[index],
    id: index,
    total: pool.length,
    lang: lang.startsWith('es') ? 'es' : 'en',
  });
}
