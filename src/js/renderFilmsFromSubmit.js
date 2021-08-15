import * as APIs from './movies-API-service';
import { refs } from './refs';
import card from '../handlebars/gallery.hbs';
import Notiflix from 'notiflix';
import { getYear } from 'date-fns';
import fPagination from './pagination';

export const findFilms = refs.formEl.addEventListener('submit', getMoviesCards);
let page = 1;
let pageArr = [];
saveGenres();

//чистим галерею при обновлении результатов поиска
function clearContainer() {
  if (refs.galleryEl.hasChildNodes() === true) {
    refs.galleryEl.innerHTML = '';
  }
  return;
}

//сбрасываем количество просмотренных страниц
function resetPage() {
  return (page = 1);
}

//счетчик страниц
function pageCounter(page) {
  page = ++page;
  return page;
}

//основная функция - callback события
export function getMoviesCards(e) {
  e.preventDefault();
  const movie = e.currentTarget.elements.searchQuery.value.trim();
  //resetPage();

  if (movie.length > 1) {
    APIs.fetchMoviesByQuery(movie, page)
      .then(res => {
        if (res.total_results === 0) {
          refs.notifyEl.classList.add('search__hint--blocked');
        } else {
          refs.notifyEl.classList.remove('search__hint--blocked');
          Notiflix.Loading.dots('Processing...');
          //___________ПАГИНАЦИЯ_______________________
          const totalHits = res.total_pages;
          const instance = fPagination();
          instance.setTotalItems(totalHits);
          instance.movePageTo(page);

          instance.on('afterMove', event => {
            const currentPage = event.page;
            OnMore(movie, currentPage);
            console.log('currentPage', currentPage);
          });
        }
        page = page + 1;
        pageArr.push(page);
        console.log(res);
        const data = res.results.map(el => {
          return el;
        });

        data.map(el => {
          const normalDate = getYear(new Date(el.release_date));
          return (el.release_date = normalDate);
        });

        //console.log(data);
        const parsedId = JSON.parse(localStorage.getItem('id'));
        const parsedName = JSON.parse(localStorage.getItem('name'));
        const arrOfGenres = getNameOfGenre(parsedId, parsedName, data);

        //console.log(arrOfGenres);

        data[0].genre_names = arrOfGenres[0];
        data[1].genre_names = arrOfGenres[1];
        data[2].genre_names = arrOfGenres[2];
        data[3].genre_names = arrOfGenres[3];
        data[4].genre_names = arrOfGenres[4];
        data[5].genre_names = arrOfGenres[5];
        data[6].genre_names = arrOfGenres[6];
        data[7].genre_names = arrOfGenres[7];
        data[8].genre_names = arrOfGenres[8];
        data[9].genre_names = arrOfGenres[9];
        data[10].genre_names = arrOfGenres[10];
        data[11].genre_names = arrOfGenres[11];
        data[12].genre_names = arrOfGenres[12];
        data[13].genre_names = arrOfGenres[13];
        data[14].genre_names = arrOfGenres[14];
        data[15].genre_names = arrOfGenres[15];
        data[16].genre_names = arrOfGenres[16];
        data[17].genre_names = arrOfGenres[17];
        data[18].genre_names = arrOfGenres[18];
        data[19].genre_names = arrOfGenres[19];

        //console.log(data);

        clearContainer();
        renderFilms(data);
        Notiflix.Loading.remove();
        return res.results;
      })
      .catch(error => {
        console.dir(error);
      });
  }
}

//рендерит разметку по шаблону
function renderFilms(data) {
  const {
    poster_path,
    title,
    original_title,
    release_date,
    vote_average,
    id,
    genre_names,
    ...rest
  } = data;

  const markup = data
    .map(({ poster_path, title, original_title, release_date, vote_average, id, genre_names }) => {
      return card({
        poster_path,
        title,
        original_title,
        release_date,
        vote_average,
        id,
        genre_names,
      });
    })
    .join('');
  //console.log(markup);
  refs.galleryEl.insertAdjacentHTML('beforeend', markup);
}

//вытягивает массив id жанров и массив names жанров, записывает в localStorage
async function saveGenres() {
  const result = await APIs.fetchGenres();
  const genres = result.genres;
  //console.log(genres)
  const idArr = genres.map(genre => {
    return genre.id;
  });

  localStorage.setItem('id', JSON.stringify(idArr));

  const nameArr = genres.map(genre => {
    return genre.name;
  });

  localStorage.setItem('name', JSON.stringify(nameArr));
}

//Выоводит массив массивов имен жанров по каждому объекту фильма согласно их genre_ids. Номер индекса подмассива жанров в массиве соответствует номеру индекса объекта фильма
function getNameOfGenre(parsedId, parsedName, data) {
  console.log(data);
  let idx = 0;
  let gNames = [];
  let foundName = '';

  const genreArrIds = data.map(el => {
    return el.genre_ids;
  });

  genreArrIds.map(item => {
    //console.log(item)
    for (let i = 0; i < item.length; i++) {
      if (parsedId.includes(item[i]) === true) {
        idx = parsedId.indexOf(item[i]);
        foundName = parsedName[idx];

        //console.log(foundName);
        gNames.push(foundName);
      } else {
        gNames.push('no genres');
      }
    }
    return gNames;
  });

  const arrLength = genreArrIds.map(item => {
    return item.length;
  });
  //console.log(gNames);
  //console.log(arrLength)

  let gArr = [];
  let slicedArr = [];
  let splicedArr = [];

  for (let i = 0; i < arrLength.length; i++) {
    if (arrLength[i] === 0) {
      gArr.push(['no genres']);
    } else if (arrLength[i] < 3) {
      slicedArr = gNames.slice(0, arrLength[i]);
      gArr.push(slicedArr);
      splicedArr = gNames.splice(0, arrLength[i]);
    } else {
      slicedArr = gNames.slice(0, arrLength[i] - 2);
      gArr.push(slicedArr);
      splicedArr = gNames.splice(0, arrLength[i]);
    }

    //console.log(slicedArr);
    //console.log(splicedArr);
  }
  return gArr;
}
//рендерит страницу с номером страницы
async function OnMore(movie, currentPage) {
  Notiflix.Loading.dots('Processing...');
  const cards = await APIs.fetchMoviesByQuery(movie, currentPage);
  let data = cards.results.map(el => {
    return el;
  });
  clearContainer();
  renderFilms(data);
  Notiflix.Loading.remove();
  console.log(cards);
}
