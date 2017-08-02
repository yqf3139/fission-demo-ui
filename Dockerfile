FROM nginx
COPY fission-ui.conf /etc/nginx/conf.d/default.conf
ADD build /build