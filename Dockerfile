FROM nginx
RUN rm /etc/nginx/conf.d/default.conf
COPY dist /usr/share/nginx/html
COPY conf /etc/nginx