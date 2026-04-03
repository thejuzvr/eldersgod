<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  const questions = [
    {
      q: "Как зовут бога-дракона времени?",
      options: ["Алдуин", "Акатош", "Аркей", "Талос"],
      answer: 1
    },
    {
      q: "Какой город является столицей Скайрима?",
      options: ["Вайтран", "Виндхельм", "Солитьюд", "Маркарт"],
      answer: 2
    },
    {
      q: "Кто является покровителем Гильдии Воров?",
      options: ["Ноктюрнал", "Меридия", "Шеогорат", "Боэтия"],
      answer: 0
    },
    {
      q: "Какое растение издает звонкий звук, если к нему подойти?",
      options: ["Корень Нирна", "Снежная ягода", "Мора Тапинелла", "Голубой горный цветок"],
      answer: 0
    },
    {
      q: "Как называется столица Морровинда?",
      options: ["Вивек", "Морнхолд", "Балмора", "Сейда Нин"],
      answer: 1
    }
  ];

  // Выбираем случайный вопрос
  const qIndex = Math.floor(Math.random() * questions.length);
  const currentQuestion = questions[qIndex];

  let selectedOption = -1;
  let result: 'none' | 'correct' | 'wrong' = 'none';

  function handleSelect(index: number) {
    if (result !== 'none') return;
    selectedOption = index;

    if (index === currentQuestion.answer) {
      result = 'correct';
      dispatch('win', { reward: { exp: 100, gold: 50 } });
    } else {
      result = 'wrong';
      dispatch('lose');
    }
  }

  function handleClose() {
    dispatch('close');
  }
</script>

<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
  <div class="parchment max-w-md w-full p-6 shadow-lg">
    <h2 class="text-2xl font-semibold text-center mb-2 text-text-primary">📜 Шепот предков</h2>

    <div class="mb-6 text-center text-sm italic text-text-muted">
      Вокруг вас появляются призрачные силуэты. Предки смотрят на вас сквозь пелену времени, желая проверить, достойны ли вы их наследия...
    </div>

    <p class="text-text-secondary text-center mb-6 text-sm font-medium">
      "{currentQuestion.q}"
    </p>

    <div class="space-y-2 mb-4">
      {#each currentQuestion.options as option, index}
        <button
          class="w-full p-3 rounded border-2 transition-all text-sm font-medium"
          class:border-accent-primary={selectedOption === index && result === 'none'}
          class:border-success={selectedOption === index && result === 'correct'}
          class:border-danger={selectedOption === index && result === 'wrong'}
          class:border-border-medium={selectedOption !== index}
          class:bg-success={selectedOption === index && result === 'correct'}
          class:bg-danger={selectedOption === index && result === 'wrong'}
          class:bg-bg-secondary={result === 'none'}
          class:text-bg-primary={selectedOption === index && result !== 'none'}
          class:text-text-primary={!(selectedOption === index && result !== 'none')}
          class:opacity-50={result !== 'none' && selectedOption !== index}
          on:click={() => handleSelect(index)}
          disabled={result !== 'none'}
        >
          {option}
        </button>
      {/each}
    </div>

    {#if result === 'correct'}
      <div class="p-3 bg-success bg-opacity-10 border border-success rounded mb-4">
        <p class="text-success font-semibold text-center text-sm">
          ✅ Предки довольно кивают и даруют вам свое благословение!
        </p>
        <div class="flex justify-center gap-4 mt-2">
          <span class="text-xs font-semibold px-2 py-1 bg-bg-primary rounded border border-border-light shadow-sm text-text-secondary">
            🌟 +100 опыта
          </span>
          <span class="text-xs font-semibold px-2 py-1 bg-bg-primary rounded border border-border-light shadow-sm text-text-secondary">
            💰 +50 золота
          </span>
        </div>
      </div>
    {:else if result === 'wrong'}
      <div class="p-3 bg-danger bg-opacity-10 border border-danger rounded mb-4">
        <p class="text-danger font-semibold text-center text-sm">
          ❌ Духи разочарованно качают головами и растворяются в воздухе... Правильный ответ: {currentQuestion.options[currentQuestion.answer]}.
        </p>
      </div>
    {/if}

    {#if result !== 'none'}
      <button class="btn w-full" on:click={handleClose}>
        Закрыть
      </button>
    {/if}
  </div>
</div>
