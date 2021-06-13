import { GetStaticProps } from 'next';
import Link from 'next/link'
import Prismic from '@prismicio/client'
import { FiCalendar, FiUser  } from 'react-icons/fi'

import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import ApiSearchResponse from '@prismicio/client/types/ApiSearchResponse';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR'

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {
  return (
    <main>
      <main className={styles.container}>
        <div className={styles.posts}>
          {postsPagination.results.map(post => (
            <Link href={`/posts/${post.uid}`}>
              <a key={post.uid}>
                <strong>{post.data.title}</strong>
                <p>{post.data.subtitle}</p>
                <time><FiCalendar/> {post.first_publication_date}</time>
                <span><FiUser /> {post.data.author}</span>
              </a>
            </Link>
          ))}
        </div>
      </main>
    </main>
  )
}

export const getStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query([Prismic.predicates.at('document.type', 'prismicdesafio')], {
    fetch: ['prismicdesafio.title', 'prismicdesafio.subtitle', 'prismicdesafio.author'],
    pageSize: 1
  });

  const resultsMap = postsResponse.results.map((post): Post => {
    return {
      uid: post.uid,
      first_publication_date:
        format(new Date(post.first_publication_date), "dd MMM Y", {
          locale: ptBR
        }),
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author
      }
    }
  })

  const postsPagination: PostPagination = {
    next_page: postsResponse.next_page,
    results: resultsMap
  }


  return {
    props: {
      postsPagination
    }
  }
};
