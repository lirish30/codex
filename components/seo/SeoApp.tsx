'use client';

import { ChangeEvent, useMemo, useState } from 'react';

import { Button, Card, CardBody, CardHeader, Input } from '@kibocommerce/kiboui';

import {
  analyzeSeo,
  defaultSeoInputs,
  SeoAnalysis,
  SeoInputs,
  SeoMetric,
} from './analysis';

type FieldName = keyof SeoInputs;

type MetricStatusClassMap = Record<SeoMetric['status'], string>;

const METRIC_STATUS_CLASS: MetricStatusClassMap = {
  success: 'seo-metric--success',
  warning: 'seo-metric--warning',
  error: 'seo-metric--error',
};

export const SeoApp = () => {
  const [inputs, setInputs] = useState<SeoInputs>(defaultSeoInputs);
  const analysis = useMemo<SeoAnalysis>(() => analyzeSeo(inputs), [inputs]);

  const handleChange = (field: FieldName) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { value } = event.target;
      setInputs((previous) => ({ ...previous, [field]: value }));
    };

  const resetForm = () => setInputs(defaultSeoInputs);

  return (
    <div className="app-shell">
      <Card>
        <CardHeader>
          <h1 className="kibo-card__title">SEO Readiness Checklist</h1>
          <p className="kibo-card__subtitle">
            Enter your page basics and get instant feedback on metadata, keyword coverage, and content
            readability.
          </p>
        </CardHeader>
        <CardBody>
          <section className="seo-section">
            <div className="seo-section__header">
              <h2>Page information</h2>
              <Button type="button" variant="ghost" onClick={resetForm}>
                Reset form
              </Button>
            </div>
            <div className="seo-form-grid">
              <div className="seo-field">
                <label htmlFor="seo-title">Page title</label>
                <Input
                  id="seo-title"
                  placeholder="e.g. Ecommerce SEO best practices"
                  value={inputs.title}
                  onChange={handleChange('title')}
                  aria-describedby="seo-title-helper"
                />
                <span id="seo-title-helper" className="seo-field__helper">
                  {inputs.title.length} characters
                </span>
              </div>

              <div className="seo-field">
                <label htmlFor="seo-description">Meta description</label>
                <Input
                  id="seo-description"
                  placeholder="Summarize the page to encourage clicks"
                  value={inputs.description}
                  onChange={handleChange('description')}
                  aria-describedby="seo-description-helper"
                />
                <span id="seo-description-helper" className="seo-field__helper">
                  {inputs.description.length} characters
                </span>
              </div>

              <div className="seo-field">
                <label htmlFor="seo-keywords">Target keywords</label>
                <Input
                  id="seo-keywords"
                  placeholder="Separate with commas"
                  value={inputs.keywords}
                  onChange={handleChange('keywords')}
                />
              </div>

              <div className="seo-field">
                <label htmlFor="seo-url">Canonical URL</label>
                <Input
                  id="seo-url"
                  placeholder="https://example.com/your-page"
                  value={inputs.url}
                  onChange={handleChange('url')}
                />
              </div>
            </div>

            <div className="seo-field">
              <label htmlFor="seo-content">Body content</label>
              <textarea
                id="seo-content"
                className="kibo-textarea"
                placeholder="Paste or write your page content to evaluate keyword usage."
                value={inputs.content}
                onChange={handleChange('content')}
                rows={6}
              />
              <span className="seo-field__helper">{inputs.content.split(/\s+/).filter(Boolean).length} words</span>
            </div>
          </section>

          <SeoMetrics analysis={analysis} />
          <SeoSuggestions analysis={analysis} />
          <KeywordInsights analysis={analysis} />
        </CardBody>
      </Card>
    </div>
  );
};

type SeoMetricsProps = {
  analysis: SeoAnalysis;
};

const SeoMetrics = ({ analysis }: SeoMetricsProps) => {
  if (!analysis.metrics.length) {
    return null;
  }

  return (
    <section className="seo-section">
      <h2>SEO metrics</h2>
      <div className="seo-metrics-grid">
        {analysis.metrics.map((metric) => (
          <article
            key={metric.id}
            className={`seo-metric ${METRIC_STATUS_CLASS[metric.status]}`.trim()}
            aria-live="polite"
          >
            <p className="seo-metric__label">{metric.label}</p>
            <p className="seo-metric__value">{metric.value}</p>
            {metric.detail ? <p className="seo-metric__detail">{metric.detail}</p> : null}
          </article>
        ))}
      </div>
    </section>
  );
};

type SeoSuggestionsProps = {
  analysis: SeoAnalysis;
};

const SeoSuggestions = ({ analysis }: SeoSuggestionsProps) => (
  <section className="seo-section">
    <h2>Suggested improvements</h2>
    <ul className="seo-suggestions">
      {analysis.suggestions.map((suggestion) => (
        <li key={suggestion}>{suggestion}</li>
      ))}
    </ul>
  </section>
);

type KeywordInsightsProps = {
  analysis: SeoAnalysis;
};

const KeywordInsights = ({ analysis }: KeywordInsightsProps) => (
  <section className="seo-section">
    <h2>Keyword insights</h2>
    {analysis.keywordInsights.length ? (
      <ul className="seo-keywords">
        {analysis.keywordInsights.map((insight) => (
          <li key={insight.keyword} className="seo-keywords__item">
            <div className="seo-keywords__term">
              <span>{insight.keyword}</span>
              {insight.isTarget ? <span className="seo-keywords__badge">Target</span> : null}
            </div>
            <div className="seo-keywords__meta">
              <span>{insight.count} {insight.count === 1 ? 'use' : 'uses'}</span>
              <span>{insight.density.toFixed(1)}% density</span>
            </div>
          </li>
        ))}
      </ul>
    ) : (
      <p className="seo-empty-state">Add content or keywords to generate insights.</p>
    )}
  </section>
);
