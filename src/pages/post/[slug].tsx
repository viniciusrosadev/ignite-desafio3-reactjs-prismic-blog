import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import { getPrismicClient } from '../../services/prismic';
import Prismic from '@prismicio/client';
import { useRouter } from 'next/router';
import { RichText } from 'prismic-dom';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
interface Post {
  uid: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
        type: string;
        spans: any[];
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  const router = useRouter();

  const readTime = post.data.content.reduce((sumTotal, content) => {
    const textTime = RichText.asText(content.body).split(' ').length;
    return Math.ceil(sumTotal + textTime / 200);
  }, 0);

  if (router.isFallback) {
    return <p>Carregando...</p>;
  }

  return (
    <>
      <Head>
        <title>{post.data.title}</title>
      </Head>

      <main className={`${commonStyles.container} ${styles.postTotal}`}>
        <img
          className={styles.banner}
          src={post.data.banner.url}
          alt={post.data.title}
        />

        <address className={styles.informationAddressBox}>
          <strong>{post.data.title}</strong>
          <div>
            <time>
              <FiCalendar />{' '}
              {format(new Date(post.first_publication_date), 'dd MMM yyyy', {
                locale: ptBR,
              })}
            </time>
            <span>
              <FiUser /> {post.data.author}
            </span>
            <time>
              <FiClock /> {readTime} min
            </time>
          </div>
        </address>
        {post.data.content.map(content => (
          <article key={content.heading}>
            <strong>{content?.heading}</strong>

            {content.body.map((body, index) => {
              const key = index;

              return body.type === 'list-item' ? (
                <ul key={key}>
                  <li>{body.text}</li>
                </ul>
              ) : (
                <p key={key}>{body.text}</p>
              );
            })}
          </article>
        ))}
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const prismicResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'prismicdesafio')],
    {
      fetch: [
        'prismicdesafio.title',
        'prismicdesafio.subtitle',
        'prismicdesafio.author',
      ],
    }
  );

  const slugsUrls = prismicResponse.results.map(slug => slug.uid);

  return {
    paths: slugsUrls.map(slug => {
      return {
        params: { slug },
      };
    }),
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;

  const prismic = getPrismicClient();
  const response = await prismic.getByUID('prismicdesafio', String(slug), {
    fetch: [
      'prismicdesafio.uid',
      'prismicdesafio.title',
      'prismicdesafio.subtitle',
      'prismicdesafio.author',
      'prismicdesafio.banner',
      'prismicdesafio.content',
    ],
  });

  const post: Post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: response.data.content.map(content => {
        return {
          heading: content.heading,
          body: content.body.map(body => {
            return {
              text: body.text,
              type: body.type,
              spans: [...body.spans],
            };
          }),
        };
      }),
    },
  };

  return {
    props: {
      post,
    },
    revalidate: 3600, // 1 hour
  };
};
