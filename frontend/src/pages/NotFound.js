import React from 'react';
import { Page, PageHero, Button } from '../components/ui';

export default function NotFound() {
  return (
    <Page title="Page not found" description="The page you are looking for could not be found.">
      <PageHero eyebrow="Error 404" title="This page has wandered off." sub="The link may be broken or the page may have moved." />
      <div className="container nf__act"><Button to="/">Back to home</Button></div>
    </Page>
  );
}
