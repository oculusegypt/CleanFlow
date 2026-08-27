<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">

  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>

  <xsl:template match="/">
    <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <title>خريطة الموقع — منصة حاويات</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Tahoma, sans-serif; background: #f8fafc; color: #1e293b; }
          header { background: #0b1f5b; color: white; padding: 24px 32px; display: flex; align-items: center; gap: 16px; }
          header img { height: 48px; }
          header h1 { font-size: 22px; font-weight: 700; }
          header p  { font-size: 13px; opacity: .75; margin-top: 4px; }
          .badge { background: #d4a017; color: white; font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 999px; margin-right: 8px; }
          .container { max-width: 960px; margin: 32px auto; padding: 0 20px; }
          table { width: 100%; border-collapse: collapse; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 6px rgba(0,0,0,.08); }
          thead tr { background: #0b1f5b; color: white; }
          thead th { padding: 14px 16px; font-size: 13px; font-weight: 600; text-align: right; }
          tbody tr { border-bottom: 1px solid #f1f5f9; transition: background .15s; }
          tbody tr:last-child { border-bottom: none; }
          tbody tr:hover { background: #f8fafc; }
          td { padding: 12px 16px; font-size: 13px; vertical-align: middle; }
          td a { color: #0b1f5b; text-decoration: none; word-break: break-all; }
          td a:hover { text-decoration: underline; color: #d4a017; }
          .pill { display: inline-block; padding: 2px 9px; border-radius: 999px; font-size: 11px; font-weight: 700; }
          .p-high   { background: #dcfce7; color: #166534; }
          .p-mid    { background: #dbeafe; color: #1e40af; }
          .p-low    { background: #f1f5f9; color: #475569; }
          .img-count { font-size: 11px; color: #94a3b8; }
          .img-count.has { color: #d4a017; font-weight: 600; }
        </style>
      </head>
      <body>
        <header>
          <img src="/logo.png" alt="منصة حاويات"/>
          <div>
            <h1>خريطة الموقع <span class="badge"><xsl:value-of select="count(sitemap:urlset/sitemap:url)"/> رابط</span></h1>
            <p>sitemap.xml — منصة حاويات</p>
          </div>
        </header>

        <div class="container">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>الرابط</th>
                <th>الأولوية</th>
                <th>التكرار</th>
                <th>آخر تعديل</th>
                <th>الصور</th>
              </tr>
            </thead>
            <tbody>
              <xsl:for-each select="sitemap:urlset/sitemap:url">
                <xsl:variable name="priority" select="sitemap:priority"/>
                <xsl:variable name="pClass">
                  <xsl:choose>
                    <xsl:when test="$priority >= 0.9">p-high</xsl:when>
                    <xsl:when test="$priority >= 0.7">p-mid</xsl:when>
                    <xsl:otherwise>p-low</xsl:otherwise>
                  </xsl:choose>
                </xsl:variable>
                <xsl:variable name="imgCount" select="count(image:image)"/>
                <tr>
                  <td style="color:#94a3b8;font-size:12px;width:36px"><xsl:value-of select="position()"/></td>
                  <td>
                    <a href="{sitemap:loc}" target="_blank" rel="noopener">
                      <xsl:value-of select="sitemap:loc"/>
                    </a>
                  </td>
                  <td>
                    <span class="pill {$pClass}"><xsl:value-of select="sitemap:priority"/></span>
                  </td>
                  <td style="color:#64748b"><xsl:value-of select="sitemap:changefreq"/></td>
                  <td style="color:#64748b;font-size:12px"><xsl:value-of select="sitemap:lastmod"/></td>
                  <td>
                    <xsl:choose>
                      <xsl:when test="$imgCount > 0">
                        <span class="img-count has">🖼 <xsl:value-of select="$imgCount"/></span>
                      </xsl:when>
                      <xsl:otherwise><span class="img-count">—</span></xsl:otherwise>
                    </xsl:choose>
                  </td>
                </tr>
              </xsl:for-each>
            </tbody>
          </table>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
